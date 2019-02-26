from django.db import models

# Create your models here.
class Player(models.Model):
    firstname = models.CharField(max_length=20)
    lastname = models.CharField(max_length=20)
    position = models.CharField(max_length=2)
    college = models.CharField(max_length=20)
    price = models.DecimalField(decimal_places=3,max_digits=10)
    rating = models.DecimalField(decimal_places=3,max_digits=10)
    ppg = models.DecimalField(decimal_places=2,max_digits=5)
    rpg = models.DecimalField(decimal_places=2,max_digits=5)
    apg = models.DecimalField(decimal_places=2,max_digits=5)
    bpg = models.DecimalField(decimal_places=2,max_digits=5)
    spg = models.DecimalField(decimal_places=2,max_digits=5)
    count = models.DecimalField(decimal_places=0,max_digits=10)

class User(models.Model):
    username = models.CharField(max_length=20)
    password = models.CharField(max_length=20)
    balance = models.DecimalField(decimal_places=3,max_digits=15)
    points = models.DecimalField(decimal_places=3,max_digits=15)
    players = models.ManyToManyField(Player)
    favoriteTeam = models.CharField(max_length=20)

class NBAPlayer(models.Model):
    firstname = models.CharField(max_length=20)
    lastname = models.CharField(max_length=20)
    position = models.CharField(max_length=2)
    college = models.CharField(max_length=20)
    ppg = models.DecimalField(decimal_places=2,max_digits=5)
    rpg = models.DecimalField(decimal_places=2,max_digits=5)
    apg = models.DecimalField(decimal_places=2,max_digits=5)
    bpg = models.DecimalField(decimal_places=2,max_digits=5)
    spg = models.DecimalField(decimal_places=2,max_digits=5)

class InitRatingsOfPlayersForUsers(models.Model):
    username = models.CharField(max_length=20)
    playerid = models.IntegerField()
    initrating = models.DecimalField(decimal_places=3,max_digits=10)

class LastUpdatedRatingOfPlayersForUsers(models.Model):
    username = models.CharField(max_length=20)
    playerid = models.IntegerField()
    lastupdated = models.DecimalField(decimal_places=3,max_digits=10)
