from django.contrib import admin
from .models import Property, Unit, PropertyImage, Document

class UnitInline(admin.TabularInline):
    model = Unit
    extra = 1

class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'address', 'created_at')
    list_filter = ('created_at', 'owner')
    search_fields = ('title', 'description', 'address')
    inlines = [UnitInline]

@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ('unit_number', 'title', 'property', 'base_price', 'is_active')
    list_filter = ('is_active', 'property')
    search_fields = ('title', 'unit_number', 'property__title')
    inlines = [PropertyImageInline]

@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'property', 'unit', 'is_main', 'created_at')

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'property', 'unit', 'uploaded_at')
    list_filter = ('category', 'uploaded_at')