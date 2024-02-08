from rest_framework import serializers
from .models import tblAccountsPayables, tblAccountsReceivables, tblCompanyInformation, tblPettyCash_Details, tblPettyCash_Master, tblUsers, tblCustomer, tblVendor, tblChartOfAccounts, tblCategory, tblEmployee, tblProduct, tblProduct_unit, tblRFQ_Master, tblRFQ_Details, tblSales_Master, tblSales_Details, tblProduct_unit, tblPurchase_Master, tblPurchase_Details, tblSalesOrder_Master, tblSalesOrder_Details,tblPurchaseOrder_Master, tblPurchaseOrder_Details, tblQuotation_Master, tblQuotation_Details, tblPreforma_Master, tblPreforma_Details, tblDeliveryNote_Master, tblDeliveryNote_Details,tblReceipt, tblPayment, tblJournalVoucher_Master, tblJournalVoucher_Details

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = tblUsers
        fields = '__all__'

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = tblCompanyInformation
        fields = '__all__'

    default_cash_account_name = serializers.SerializerMethodField()
    default_bank_account_name = serializers.SerializerMethodField()
    default_sales_account_name = serializers.SerializerMethodField()
    default_purchase_account_name = serializers.SerializerMethodField()
    default_sales_return_account_name = serializers.SerializerMethodField()
    default_purchase_return_account_name = serializers.SerializerMethodField()
    default_accounts_receivable_account_name = serializers.SerializerMethodField()
    default_accounts_payable_account_name = serializers.SerializerMethodField()
    default_vat_recoverable_account_name = serializers.SerializerMethodField()
    default_vat_payable_account_name = serializers.SerializerMethodField()
    default_credit_card_account_name = serializers.SerializerMethodField()
    default_credit_card_bank_account_name = serializers.SerializerMethodField()
    default_credit_card_commission_account_name = serializers.SerializerMethodField()
    default_pettycash_account_name = serializers.SerializerMethodField()
    default_depreciation_account_name = serializers.SerializerMethodField()
    default_bad_debts_account_name = serializers.SerializerMethodField()
    default_sales_discount_account_name = serializers.SerializerMethodField()
    default_purchase_discount_account_name = serializers.SerializerMethodField()
    default_inventory_account_name = serializers.SerializerMethodField()
    default_pdc_issued_account_name = serializers.SerializerMethodField()
    default_pdc_received_account_name = serializers.SerializerMethodField()

    def get_default_cash_account_name(self, obj):
        return obj.default_cash_account.account_name if obj.default_cash_account else None

    def get_default_bank_account_name(self, obj):
        return obj.default_bank_account.account_name if obj.default_bank_account else None

    def get_default_sales_account_name(self, obj):
        return obj.default_sales_account.account_name if obj.default_sales_account else None

    def get_default_purchase_account_name(self, obj):
        return obj.default_purchase_account.account_name if obj.default_purchase_account else None

    def get_default_sales_return_account_name(self, obj):
        return obj.default_sales_return_account.account_name if obj.default_sales_return_account else None

    def get_default_purchase_return_account_name(self, obj):
        return obj.default_purchase_return_account.account_name if obj.default_purchase_return_account else None

    def get_default_accounts_receivable_account_name(self, obj):
        return obj.default_accounts_receivable_account.account_name if obj.default_accounts_receivable_account else None

    def get_default_accounts_payable_account_name(self, obj):
        return obj.default_accounts_payable_account.account_name if obj.default_accounts_payable_account else None

    def get_default_vat_recoverable_account_name(self, obj):
        return obj.default_vat_recoverable_account.account_name if obj.default_vat_recoverable_account else None

    def get_default_vat_payable_account_name(self, obj):
        return obj.default_vat_payable_account.account_name if obj.default_vat_payable_account else None

    def get_default_credit_card_account_name(self, obj):
        return obj.default_credit_card_account.account_name if obj.default_credit_card_account else None

    def get_default_credit_card_bank_account_name(self, obj):
        return obj.default_credit_card_bank_account.account_name if obj.default_credit_card_bank_account else None

    def get_default_credit_card_commission_account_name(self, obj):
        return obj.default_credit_card_commission_account.account_name if obj.default_credit_card_commission_account else None

    def get_default_pettycash_account_name(self, obj):
        return obj.default_pettycash_account.account_name if obj.default_pettycash_account else None

    def get_default_depreciation_account_name(self, obj):
        return obj.default_depreciation_account.account_name if obj.default_depreciation_account else None

    def get_default_bad_debts_account_name(self, obj):
        return obj.default_bad_debts_account.account_name if obj.default_bad_debts_account else None

    def get_default_sales_discount_account_name(self, obj):
        return obj.default_sales_discount_account.account_name if obj.default_sales_discount_account else None

    def get_default_purchase_discount_account_name(self, obj):
        return obj.default_purchase_discount_account.account_name if obj.default_purchase_discount_account else None

    def get_default_inventory_account_name(self, obj):
        return obj.default_inventory_account.account_name if obj.default_inventory_account else None

    def get_default_pdc_issued_account_name(self, obj):
        return obj.default_pdc_issued_account.account_name if obj.default_pdc_issued_account else None

    def get_default_pdc_received_account_name(self, obj):
        return obj.default_pdc_received_account.account_name if obj.default_pdc_received_account else None

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = tblCategory
        fields = '__all__'
        
class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = tblEmployee
        fields = '__all__'

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = tblCustomer
        fields = '__all__'

class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = tblVendor
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = tblProduct
        fields = '__all__'

    vendor_name = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()
    inventory_account_name = serializers.SerializerMethodField()
    cost_account_name = serializers.SerializerMethodField()
    income_account_name = serializers.SerializerMethodField()
        
    def get_vendor_name(self, obj):
        return obj.vendor.vendor_name if obj.vendor else None
        
    def get_category_name(self, obj):
        return obj.category.category_name if obj.category else None
        
    def get_inventory_account_name(self, obj):
        return obj.inventory_account.account_name if obj.inventory_account else None
        
    def get_cost_account_name(self, obj):
        return obj.cost_account.account_name if obj.cost_account else None
        
    def get_income_account_name(self, obj):
        return obj.income_account.account_name if obj.income_account else None

class ProductUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = tblProduct_unit
        fields = '__all__'

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = tblChartOfAccounts
        fields = '__all__'

class SalesSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    salesman_name = serializers.SerializerMethodField()
    
    class Meta:
        model = tblSales_Master
        fields = '__all__'
        
    def get_customer_name(self, obj):
        return obj.customer.customer_name if obj.customer else None
        
    def get_salesman_name(self, obj):
        return obj.salesman.employee_name if obj.salesman else None
    
class SalesDetailsSerializer(serializers.ModelSerializer):
    product_code = serializers.SerializerMethodField()
    units = serializers.SerializerMethodField()

    class Meta:
        model = tblSales_Details
        fields = '__all__'

    def get_product_code(self, obj):
        return obj.product.product_code if obj.product else None
    
    def get_units(self, obj):
        product_units_data = []

        # Include the main unit from tblProduct as the first item
        main_unit_data = {
            'unit': obj.product.main_unit,
            'multiple': '*',
            'multiple_value': '1.00',
        }
        product_units_data.append(main_unit_data)

        # Include the rest of the units from tblProduct_unit
        for unit in obj.get_units():
            unit_data = {
                'unit': unit.unit,
                'multiple': unit.multiple,
                'multiple_value': unit.multiple_value,
            }
            product_units_data.append(unit_data)

        return product_units_data

class PurchaseSerializer(serializers.ModelSerializer):
    vendor_name = serializers.SerializerMethodField()
    salesman_name = serializers.SerializerMethodField()
    
    class Meta:
        model = tblPurchase_Master
        fields = '__all__'
        
    def get_vendor_name(self, obj):
        return obj.vendor.vendor_name if obj.vendor else None
        
    def get_salesman_name(self, obj):
        return obj.salesman.employee_name if obj.salesman else None
    
class PurchaseDetailsSerializer(serializers.ModelSerializer):
    product_code = serializers.SerializerMethodField()
    units = serializers.SerializerMethodField()

    class Meta:
        model = tblPurchase_Details
        fields = '__all__'

    def get_product_code(self, obj):
        return obj.product.product_code if obj.product else None
    
    def get_units(self, obj):
        product_units_data = []

        # Include the main unit from tblProduct as the first item
        main_unit_data = {
            'unit': obj.product.main_unit,
            'multiple': '*',
            'multiple_value': '1.00',
        }
        product_units_data.append(main_unit_data)

        # Include the rest of the units from tblProduct_unit
        for unit in obj.get_units():
            unit_data = {
                'unit': unit.unit,
                'multiple': unit.multiple,
                'multiple_value': unit.multiple_value,
            }
            product_units_data.append(unit_data)

        return product_units_data

class SalesOrderSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    salesman_name = serializers.SerializerMethodField()
    
    class Meta:
        model = tblSalesOrder_Master
        fields = '__all__'
        
    def get_customer_name(self, obj):
        return obj.customer.customer_name if obj.customer else None
        
    def get_salesman_name(self, obj):
        return obj.salesman.employee_name if obj.salesman else None
    
class SalesOrderDetailsSerializer(serializers.ModelSerializer):
    product_code = serializers.SerializerMethodField()
    units = serializers.SerializerMethodField()

    class Meta:
        model = tblSalesOrder_Details
        fields = '__all__'

    def get_product_code(self, obj):
        return obj.product.product_code if obj.product else None
    
    def get_units(self, obj):
        product_units_data = []

        # Include the main unit from tblProduct as the first item
        main_unit_data = {
            'unit': obj.product.main_unit,
            'multiple': '*',
            'multiple_value': '1.00',
        }
        product_units_data.append(main_unit_data)

        # Include the rest of the units from tblProduct_unit
        for unit in obj.get_units():
            unit_data = {
                'unit': unit.unit,
                'multiple': unit.multiple,
                'multiple_value': unit.multiple_value,
            }
            product_units_data.append(unit_data)

        return product_units_data

class PurchaseOrderSerializer(serializers.ModelSerializer):
    vendor_name = serializers.SerializerMethodField()
    salesman_name = serializers.SerializerMethodField()
    
    class Meta:
        model = tblPurchaseOrder_Master
        fields = '__all__'
        
    def get_vendor_name(self, obj):
        return obj.vendor.vendor_name if obj.vendor else None
        
    def get_salesman_name(self, obj):
        return obj.salesman.employee_name if obj.salesman else None
    
class PurchaseOrderDetailsSerializer(serializers.ModelSerializer):
    product_code = serializers.SerializerMethodField()
    units = serializers.SerializerMethodField()

    class Meta:
        model = tblPurchaseOrder_Details
        fields = '__all__'

    def get_product_code(self, obj):
        return obj.product.product_code if obj.product else None
    
    def get_units(self, obj):
        product_units_data = []

        # Include the main unit from tblProduct as the first item
        main_unit_data = {
            'unit': obj.product.main_unit,
            'multiple': '*',
            'multiple_value': '1.00',
        }
        product_units_data.append(main_unit_data)

        # Include the rest of the units from tblProduct_unit
        for unit in obj.get_units():
            unit_data = {
                'unit': unit.unit,
                'multiple': unit.multiple,
                'multiple_value': unit.multiple_value,
            }
            product_units_data.append(unit_data)

        return product_units_data

class QuotationSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    salesman_name = serializers.SerializerMethodField()
    
    class Meta:
        model = tblQuotation_Master
        fields = '__all__'
        
    def get_customer_name(self, obj):
        return obj.customer.customer_name if obj.customer else None
        
    def get_salesman_name(self, obj):
        return obj.salesman.employee_name if obj.salesman else None
    
class QuotationDetailsSerializer(serializers.ModelSerializer):
    product_code = serializers.SerializerMethodField()
    units = serializers.SerializerMethodField()

    class Meta:
        model = tblQuotation_Details
        fields = '__all__'

    def get_product_code(self, obj):
        return obj.product.product_code if obj.product else None
    
    def get_units(self, obj):
        product_units_data = []

        # Include the main unit from tblProduct as the first item
        main_unit_data = {
            'unit': obj.product.main_unit,
            'multiple': '*',
            'multiple_value': '1.00',
        }
        product_units_data.append(main_unit_data)

        # Include the rest of the units from tblProduct_unit
        for unit in obj.get_units():
            unit_data = {
                'unit': unit.unit,
                'multiple': unit.multiple,
                'multiple_value': unit.multiple_value,
            }
            product_units_data.append(unit_data)

        return product_units_data

class PreformaSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    salesman_name = serializers.SerializerMethodField()
    
    class Meta:
        model = tblPreforma_Master
        fields = '__all__'
        
    def get_customer_name(self, obj):
        return obj.customer.customer_name if obj.customer else None
        
    def get_salesman_name(self, obj):
        return obj.salesman.employee_name if obj.salesman else None
    
class PreformaDetailsSerializer(serializers.ModelSerializer):
    product_code = serializers.SerializerMethodField()
    units = serializers.SerializerMethodField()

    class Meta:
        model = tblPreforma_Details
        fields = '__all__'

    def get_product_code(self, obj):
        return obj.product.product_code if obj.product else None
    
    def get_units(self, obj):
        product_units_data = []

        # Include the main unit from tblProduct as the first item
        main_unit_data = {
            'unit': obj.product.main_unit,
            'multiple': '*',
            'multiple_value': '1.00',
        }
        product_units_data.append(main_unit_data)

        # Include the rest of the units from tblProduct_unit
        for unit in obj.get_units():
            unit_data = {
                'unit': unit.unit,
                'multiple': unit.multiple,
                'multiple_value': unit.multiple_value,
            }
            product_units_data.append(unit_data)

        return product_units_data
    
class RFQSerializer(serializers.ModelSerializer):
    vendor_name = serializers.SerializerMethodField()
    salesman_name = serializers.SerializerMethodField()


    class Meta:
        model = tblRFQ_Master
        fields = '__all__'
        
    def get_vendor_name(self, obj):
        return obj.vendor.vendor_name if obj.vendor else None
        
    def get_salesman_name(self, obj):
        return obj.salesman.employee_name if obj.salesman else None
    
class RFQDetailsSerializer(serializers.ModelSerializer):
    product_code = serializers.SerializerMethodField()
    units = serializers.SerializerMethodField()

    class Meta:
        model = tblRFQ_Details
        fields = '__all__'

    def get_product_code(self, obj):
        return obj.product.product_code if obj.product else None

    def get_units(self, obj):
        product_units_data = []

        # Include the main unit from tblProduct as the first item
        main_unit_data = {
            'unit': obj.product.main_unit,
            'multiple': '*',
            'multiple_value': '1.00',
        }
        product_units_data.append(main_unit_data)

        # Include the rest of the units from tblProduct_unit
        for unit in obj.get_units():
            unit_data = {
                'unit': unit.unit,
                'multiple': unit.multiple,
                'multiple_value': unit.multiple_value,
            }
            product_units_data.append(unit_data)

        return product_units_data

class DeliveryNoteSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    salesman_name = serializers.SerializerMethodField()
    
    class Meta:
        model = tblDeliveryNote_Master
        fields = '__all__'
        
    def get_customer_name(self, obj):
        return obj.customer.customer_name if obj.customer else None
        
    def get_salesman_name(self, obj):
        return obj.salesman.employee_name if obj.salesman else None
    
class DeliveryNoteDetailsSerializer(serializers.ModelSerializer):
    product_code = serializers.SerializerMethodField()
    units = serializers.SerializerMethodField()

    class Meta:
        model = tblDeliveryNote_Details
        fields = '__all__'

    def get_product_code(self, obj):
        return obj.product.product_code if obj.product else None
    
    def get_units(self, obj):
        product_units_data = []

        # Include the main unit from tblProduct as the first item
        main_unit_data = {
            'unit': obj.product.main_unit,
            'multiple': '*',
            'multiple_value': '1.00',
        }
        product_units_data.append(main_unit_data)

        # Include the rest of the units from tblProduct_unit
        for unit in obj.get_units():
            unit_data = {
                'unit': unit.unit,
                'multiple': unit.multiple,
                'multiple_value': unit.multiple_value,
            }
            product_units_data.append(unit_data)

        return product_units_data
    
class JournalVoucherSerializer(serializers.ModelSerializer):
    class Meta:
        model = tblJournalVoucher_Master
        fields = '__all__'
    
class JournalVoucherDetailsSerializer(serializers.ModelSerializer):
    account_code = serializers.SerializerMethodField()
    account_name = serializers.SerializerMethodField()
    jv = JournalVoucherSerializer()
    
    
    class Meta:
        model = tblJournalVoucher_Details
        fields = '__all__'
        
    def get_account_code(self, obj):
        return obj.account.account_code if obj.account else None
        
    def get_account_name(self, obj):
        return obj.account.account_name if obj.account else None
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if representation['account'] == 13:
            representation['name'] = tblCustomer.objects.get(id = representation['name']).customer_name
        elif representation['account'] == 14:
            representation['name'] = tblVendor.objects.get(id = representation['name']).vendor_name
        return representation
    
class PaymentSerializer(serializers.ModelSerializer):
    vendor_name = serializers.SerializerMethodField()
    
    
    class Meta:
        model = tblPayment
        fields = '__all__'
        
    def get_vendor_name(self, obj):
        return obj.vendor.vendor_name if obj.vendor else None
    
class ReceiptSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    
    
    class Meta:
        model = tblReceipt
        fields = '__all__'
        
    def get_customer_name(self, obj):
        return obj.customer.customer_name if obj.customer else None
    
class AccountsReceivablesSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer()
    invoice = SalesSerializer()
    
    class Meta:
        model = tblAccountsReceivables
        fields = '__all__'
    
class AccountsPayablesSerializer(serializers.ModelSerializer):
    vendor = VendorSerializer()
    invoice = PurchaseSerializer()
    
    class Meta:
        model = tblAccountsPayables
        fields = '__all__'

        
class PettyCashSerializer(serializers.ModelSerializer):
    account = AccountSerializer()
    
    class Meta:
        model = tblPettyCash_Master
        fields = '__all__'
    
class PettyCashDetailsSerializer(serializers.ModelSerializer):
    account = AccountSerializer()
    
    class Meta:
        model = tblPettyCash_Details
        fields = '__all__'




class SalesReportSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer()
    salesman = EmployeeSerializer()
    
    class Meta:
        model = tblSales_Master
        fields = '__all__'

class SalesReportDetailsSerializer(serializers.ModelSerializer):
    sales = SalesReportSerializer()

    class Meta:
        model = tblSales_Details
        fields = '__all__'
