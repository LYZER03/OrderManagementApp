from rest_framework import serializers
from .models import Order
from authentication.serializers import UserSerializer

class OrderSerializer(serializers.ModelSerializer):
    preparation_time = serializers.SerializerMethodField()
    control_time = serializers.SerializerMethodField()
    packing_time = serializers.SerializerMethodField()
    total_time = serializers.SerializerMethodField()
    creator_details = UserSerializer(source='creator', read_only=True)
    preparer_details = UserSerializer(source='preparer', read_only=True)
    controller_details = UserSerializer(source='controller', read_only=True)
    packer_details = UserSerializer(source='packer', read_only=True)
    
    class Meta:
        model = Order
        fields = (
            'id', 'reference', 'status', 'cart_number', 'line_count',
            'creator', 'creator_details',
            'preparer', 'preparer_details',
            'controller', 'controller_details',
            'packer', 'packer_details',
            'created_at', 'prepared_at', 'controlled_at', 'packed_at', 'completed_at',
            'preparation_time', 'control_time', 'packing_time', 'total_time'
        )
        read_only_fields = (
            'id', 'creator', 'preparer', 'controller', 'packer',
            'created_at', 'prepared_at', 'controlled_at', 'packed_at', 'completed_at'
        )
    
    def get_preparation_time(self, obj):
        return obj.preparation_time()
    
    def get_control_time(self, obj):
        return obj.control_time()
    
    def get_packing_time(self, obj):
        return obj.packing_time()
    
    def get_total_time(self, obj):
        return obj.total_time()

class OrderCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ('reference', 'cart_number', 'line_count')
    
    def create(self, validated_data):
        user = self.context['request'].user
        return Order.objects.create(creator=user, **validated_data)

class OrderUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ('reference', 'cart_number', 'status', 'line_count')
        read_only_fields = ('reference',)
