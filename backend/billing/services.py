from django.template.loader import render_to_string
from weasyprint import HTML
from django.core.files.base import ContentFile
from .models import Invoice
from properties.models import Document

def generate_invoice_pdf(invoice_id):
    """
    Generates a professional PDF using WeasyPrint and saves it to the Document Vault.
    """
    try:
        invoice = Invoice.objects.select_related('booking__unit__property', 'booking__tenant').get(id=invoice_id)
        
        # Context for the template
        context = {
            'invoice': invoice,
            'unit': invoice.booking.unit,
            'property': invoice.booking.unit.property,
            'tenant': invoice.booking.tenant,
        }
        
        # Render HTML to string
        # Note: We need to create this template
        html_string = render_to_string('billing/invoice_pdf.html', context)
        
        # Generate PDF
        pdf_file = HTML(string=html_string).write_pdf()
        
        # Save to Document Vault
        doc = Document.objects.create(
            unit=invoice.booking.unit,
            property=invoice.booking.unit.property,
            title=f"Invoice_{invoice.id}_{invoice.booking.tenant.username}",
            category='lease', # Reusing lease for financial docs or add 'invoice'
        )
        doc.file.save(f"invoice_{invoice.id}.pdf", ContentFile(pdf_file))
        
        return doc.file.url
    except Exception as e:
        print(f"PDF Generation Error: {e}")
        return None
