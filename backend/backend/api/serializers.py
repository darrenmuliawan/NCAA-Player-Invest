from backend.api.models import User
from backend.api.models import Player
from backend.api.models import NBAPlayer
from backend.api.models import InitRatingsOfPlayersForUsers
from backend.api.models import LastUpdatedRatingOfPlayersForUsers
from rest_framework import serializers

class PlayerSerializer(serializers.ModelSerializer):
    firstname = serializers.CharField(max_length=20)
    lastname = serializers.CharField(max_length=20)
    position = serializers.CharField(max_length=2)
    college = serializers.CharField(max_length=20)
    rating = serializers.DecimalField(decimal_places=3,max_digits=10)
    price = serializers.DecimalField(decimal_places=3,max_digits=10)
    ppg = serializers.DecimalField(decimal_places=2,max_digits=5)
    rpg = serializers.DecimalField(decimal_places=2,max_digits=5)
    apg = serializers.DecimalField(decimal_places=2,max_digits=5)
    bpg = serializers.DecimalField(decimal_places=2,max_digits=5)
    spg = serializers.DecimalField(decimal_places=2,max_digits=5)
    count = serializers.DecimalField(decimal_places=0,max_digits=10)

    class Meta:
        model = Player
        fields = ( 'id', 'firstname', 'lastname', 'position', 'college', 'rating', 'price', 'ppg', 'rpg', 'apg', 'bpg', 'spg', 'count')

    # print("IN Player serializer class")
    def create(self, validated_data):
        # print("IN Player create method in serializer class")
        return Player.objects.create(**validated_data)

class NBAPlayerSerializer(serializers.ModelSerializer):
    firstname = serializers.CharField(max_length=20)
    lastname = serializers.CharField(max_length=20)
    position = serializers.CharField(max_length=2)
    college = serializers.CharField(max_length=20)
    ppg = serializers.DecimalField(decimal_places=2,max_digits=5)
    rpg = serializers.DecimalField(decimal_places=2,max_digits=5)
    apg = serializers.DecimalField(decimal_places=2,max_digits=5)
    bpg = serializers.DecimalField(decimal_places=2,max_digits=5)
    spg = serializers.DecimalField(decimal_places=2,max_digits=5)
    # print("IN NBAPlayer serializer class")

    class Meta:
        model = NBAPlayer
        fields = ( 'id', 'firstname', 'lastname', 'position', 'college', 'ppg', 'rpg', 'apg', 'bpg', 'spg')

    def create(self, validated_data):
        # print("IN NBAPlayer create method in serializer class")
        return NBAPlayer.objects.create(**validated_data)

class UserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(max_length=20)
    password = serializers.CharField(max_length=20)
    balance = serializers.DecimalField(decimal_places=3,max_digits=15)
    points = serializers.DecimalField(decimal_places=3,max_digits=15)
    players = serializers.PrimaryKeyRelatedField(many=True, queryset=Player.objects.all(), allow_null=True)
    favoriteTeam = serializers.CharField(max_length=20)

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'balance', 'points', 'players', 'favoriteTeam')

    # print("IN User serializer class")
    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.password = validated_data.get('password', instance.password)
        instance.points = validated_data.get('points', instance.points)
        instance.balance = validated_data.get('balance', instance.balance)
        instance.players.set(validated_data['players'])
        instance.favoriteTeam = validated_data.get('favoriteTeam', instance.favoriteTeam)
        instance.save()
        return instance
        # print("IN User update method in serializer class")
        # #instance is the current object to be updated, validated_data is the request body
        # print('valida = ', validated_data)
        # print('instance = ', instance.id)
        # user_to_update = User.objects.filter()
        # print("user = ", user_to_update)
class InitRatingsOfPlayersForUsersSerializer(serializers.ModelSerializer):
    username = serializers.CharField(max_length=20)
    playerid = serializers.IntegerField()
    initrating = serializers.DecimalField(decimal_places=3,max_digits=10)

    class Meta:
        model = User
        fields = ('id', 'username', 'playerid', 'initrating')

    def create(self, validated_data):
        # print("IN NBAPlayer create method in serializer class")
        return InitRatingsOfPlayersForUsers.objects.create(**validated_data)

class LastUpdatedRatingOfPlayersForUsersSerializer(serializers.ModelSerializer):
    username = serializers.CharField(max_length=20)
    playerid = serializers.IntegerField()
    lastupdated = serializers.DecimalField(decimal_places=3,max_digits=10)

    class Meta:
        model = User
        fields = ('id', 'username', 'playerid', 'lastupdated')

    def create(self, validated_data):
        # print("IN NBAPlayer create method in serializer class")
        return LastUpdatedRatingOfPlayersForUsers.objects.create(**validated_data)
