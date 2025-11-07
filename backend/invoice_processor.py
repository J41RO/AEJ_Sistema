"""
Invoice Processing Module
Handles automatic extraction and processing of purchase invoices
"""
import os
import shutil
from datetime import datetime
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException

from models import (
    Supplier as SupplierModel,
    Product as ProductModel,
    PurchaseInvoice as PurchaseInvoiceModel,
    PurchaseInvoiceItem as PurchaseInvoiceItemModel,
    InventoryMovement as InventoryMovementModel,
    User as UserModel,
    MovementType,
    PurchaseInvoiceStatus,
    ProductCategory
)


class InvoiceProcessor:
    """Process purchase invoices and update inventory"""
    
    def __init__(self, db: Session, current_user: UserModel):
        self.db = db
        self.current_user = current_user
        self.upload_dir = "uploads/invoices"
        os.makedirs(self.upload_dir, exist_ok=True)
    
    async def save_pdf(self, file: UploadFile, numero_factura: str) -> str:
        """Save uploaded PDF file"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{numero_factura}_{timestamp}.pdf"
        filepath = os.path.join(self.upload_dir, filename)
        
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return filepath
    
    def find_or_create_supplier(self, supplier_data: Dict) -> SupplierModel:
        """Find existing supplier by NIT or create new one"""
        nit = supplier_data.get("nit")
        
        # Try to find existing supplier
        supplier = self.db.query(SupplierModel).filter(
            SupplierModel.nit == nit
        ).first()
        
        if supplier:
            # Update supplier info if provided
            if supplier_data.get("razon_social"):
                supplier.razon_social = supplier_data["razon_social"]
            if supplier_data.get("email"):
                supplier.email = supplier_data["email"]
            if supplier_data.get("telefono"):
                supplier.telefono = supplier_data["telefono"]
            if supplier_data.get("ciudad"):
                supplier.ciudad = supplier_data["ciudad"]
            if supplier_data.get("direccion"):
                supplier.direccion = supplier_data["direccion"]
            
            self.db.commit()
            return supplier
        
        # Create new supplier
        new_supplier = SupplierModel(
            nit=nit,
            razon_social=supplier_data.get("razon_social", ""),
            nombre_comercial=supplier_data.get("razon_social", ""),
            email=supplier_data.get("email"),
            telefono=supplier_data.get("telefono"),
            direccion=supplier_data.get("direccion"),
            ciudad=supplier_data.get("ciudad"),
            is_active=True
        )
        
        self.db.add(new_supplier)
        self.db.commit()
        self.db.refresh(new_supplier)
        
        return new_supplier
    
    def find_or_create_product(self, product_data: Dict) -> ProductModel:
        """Find existing product by reference/code or create new one"""
        referencia = product_data.get("referencia", "")
        nombre = product_data.get("nombre", "")
        
        # Try to find by reference
        product = self.db.query(ProductModel).filter(
            ProductModel.codigo == referencia
        ).first()
        
        if product:
            return product
        
        # Try to find by similar name
        product = self.db.query(ProductModel).filter(
            ProductModel.nombre.ilike(f"%{nombre[:20]}%")
        ).first()
        
        if product:
            return product
        
        # Create new product
        precio_compra = product_data.get("precio_unitario", 0)
        precio_venta = precio_compra * 1.5  # 50% markup by default
        
        new_product = ProductModel(
            codigo=referencia or f"AUTO-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            nombre=nombre,
            descripcion=f"Producto importado automáticamente de factura",
            categoria=ProductCategory.ACCESORIOS,  # Default category
            precio_compra=precio_compra,
            precio_venta=precio_venta,
            stock_actual=0,
            stock_minimo=5,
            is_active=True
        )
        
        self.db.add(new_product)
        self.db.commit()
        self.db.refresh(new_product)
        
        return new_product
    
    def update_inventory(
        self, 
        product: ProductModel, 
        cantidad: int, 
        referencia: str
    ) -> InventoryMovementModel:
        """Update product inventory and create movement record"""
        old_stock = product.stock_actual
        product.stock_actual += cantidad
        
        movement = InventoryMovementModel(
            product_id=product.id,
            user_id=self.current_user.id,
            tipo=MovementType.ENTRADA,
            cantidad=cantidad,
            stock_anterior=old_stock,
            stock_nuevo=product.stock_actual,
            motivo=f"Compra - Factura {referencia}",
            referencia=referencia
        )
        
        self.db.add(movement)
        return movement
    
    async def process_invoice(
        self, 
        invoice_data: Dict,
        pdf_file: Optional[UploadFile] = None
    ) -> PurchaseInvoiceModel:
        """
        Process complete invoice: create/update supplier, products, and inventory
        
        Args:
            invoice_data: Dictionary with invoice information
            pdf_file: Optional PDF file upload
            
        Returns:
            Created PurchaseInvoiceModel
        """
        try:
            # 1. Find or create supplier
            supplier = self.find_or_create_supplier(invoice_data["proveedor"])
            
            # 2. Save PDF if provided
            archivo_pdf = None
            if pdf_file:
                archivo_pdf = await self.save_pdf(
                    pdf_file, 
                    invoice_data["factura"]["numero"]
                )
            
            # 3. Create purchase invoice
            fecha_emision = datetime.strptime(
                invoice_data["factura"]["fecha"], 
                "%Y-%m-%d"
            )
            
            fecha_aceptacion = None
            if invoice_data["factura"].get("fecha_aceptacion"):
                try:
                    fecha_aceptacion = datetime.fromisoformat(
                        invoice_data["factura"]["fecha_aceptacion"]
                    )
                except:
                    pass
            
            purchase_invoice = PurchaseInvoiceModel(
                numero_factura=invoice_data["factura"]["numero"],
                supplier_id=supplier.id,
                fecha_emision=fecha_emision,
                cufe=invoice_data["factura"].get("cufe"),
                fecha_aceptacion=fecha_aceptacion,
                firma_digital=invoice_data["factura"].get("firma_digital"),
                subtotal=invoice_data["totales"]["subtotal"],
                iva=invoice_data["totales"]["iva"],
                total=invoice_data["totales"]["total"],
                archivo_pdf=archivo_pdf,
                status=PurchaseInvoiceStatus.PROCESADA
            )
            
            self.db.add(purchase_invoice)
            self.db.flush()  # Get invoice ID
            
            # 4. Process each product
            for product_data in invoice_data["productos"]:
                # Find or create product
                product = self.find_or_create_product(product_data)
                
                # Create invoice item
                invoice_item = PurchaseInvoiceItemModel(
                    purchase_invoice_id=purchase_invoice.id,
                    product_id=product.id,
                    cantidad=product_data["cantidad"],
                    precio_unitario=product_data["precio_unitario"],
                    subtotal=product_data["total"]
                )
                self.db.add(invoice_item)
                
                # Update inventory
                self.update_inventory(
                    product,
                    product_data["cantidad"],
                    purchase_invoice.numero_factura
                )
            
            # 5. Commit all changes
            self.db.commit()
            self.db.refresh(purchase_invoice)
            
            return purchase_invoice
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Error processing invoice: {str(e)}"
            )