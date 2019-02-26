  #printfrom django.shortcuts import render
from django.http import Http404
from rest_framework import viewsets
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework import status
from backend.api.serializers import UserSerializer
from backend.api.serializers import PlayerSerializer
from backend.api.serializers import NBAPlayerSerializer
from backend.api.serializers import InitRatingsOfPlayersForUsersSerializer
from backend.api.serializers import LastUpdatedRatingOfPlayersForUsersSerializer
from rest_framework.response import Response
from backend.api.models import User
from backend.api.models import Player
from backend.api.models import NBAPlayer
from backend.api.models import InitRatingsOfPlayersForUsers
from backend.api.models import LastUpdatedRatingOfPlayersForUsers
from django.db.models import Avg
from backend.api.calculatePlayerRatings import compute_final_rating
from backend.api.recommend import recommend_player_to_user
# from django.utils import simplejson
from django.http import JsonResponse
import pandas as pd
import numpy as np
import csv

class UserLogin(APIView):
    def get_object(self, username, password):
        try:
            # print("in try:", User.objects.get(username="user1"))
            return User.objects.get(username=username, password=password)
        except User.DoesNotExist:
            raise Http404

    def post(self, request, format=None):
        if "username" in request.data and "password" in request.data:
            #print("has username and password keys")
            user = self.get_object(request.data['username'], request.data['password'])
            # if user.players.filter(id = '1'):
                #print("YES1")
            # if user.players.filter(id = '2'):
                #print("YES2")
            # if user.players.filter(id = '3'):
                #print("YES3")
            # if user.players.all()[0] == 1:
                #print("WORKED")
            # else:
                #print("NOT WORKED")
            #print(user.players.filter(id = '1'))
            serializer = UserSerializer(user)
        else:
            #print("Does not have correct keys in request body")
            raise Http404

        return Response(serializer.data)

class UserListView(APIView):
    def get_player(self, pk):
        try:
            return Player.objects.get(pk=pk)
        except User.DoesNotExist:
            raise Http404

    def get(self, request, format=None):
        checker = Player.objects.values_list('college', flat=True)
        l = list(checker)
        #print(l[0])
        #print(l)
        # for i in Player.objects.all():
        #     #print(i.firstname)
        #print(checker)
        # forwards=Player.objects.filter(position='F')
        # print("Average points: ", forwards.aggregate(Avg('ppg'))['ppg__avg'])
        # for p in forwards:
        #     #print(p.firstname)
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        # print("serializer.data:", serializer.data)
        # print("serializer.data:", serializer.data)
        # print("Response(serializer.data):", Response(serializer.data))
        return Response(serializer.data)

    def post(self, request, format=None):

        # print("request.data['players']:", request.data['players'])
        total_price = 0
        for p in request.data['players']:
            total_price += self.get_player(p).price

        if total_price > float(request.data['balance']):
            raise Http404

        request.data['balance'] = str(float(request.data['balance']) - float(total_price))
        serializer = UserSerializer(data=request.data)
        for p in request.data['players']:
            player = self.get_player(p)
            #print("p id is=", p)
            #print("player.count before=", player.count)
            player.count += 1
            #print("player.count after=", player.count)
            player.save(update_fields = ['count'])
            serializer2 = InitRatingsOfPlayersForUsersSerializer(data={'username':str(request.data['username']), 'playerid':str(player.id), 'initrating':str(player.rating)})
            if serializer2.is_valid():
                serializer2.save()
            serializer2 = LastUpdatedRatingOfPlayersForUsersSerializer(data={'username':str(request.data['username']), 'playerid':str(player.id), 'lastupdated':str(player.rating)})
            if serializer2.is_valid():
                serializer2.save()
        if serializer.is_valid():
            serializer.save()
            #Update all the ratings of the players
            compute_final_rating()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserDetailView(APIView):
    def get_object(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            raise Http404

    def get_player(self, pk):
        try:
            return Player.objects.get(pk=pk)
        except User.DoesNotExist:
            raise Http404

    def delete_ratings_records(self, username, playerid):
        try:
            InitRatingsOfPlayersForUsers.objects.get(username=username, playerid=playerid).delete()
            LastUpdatedRatingOfPlayersForUsers.objects.get(username=username, playerid=playerid).delete()
        except InitRatingsOfPlayersForUsers.DoesNotExist:
            raise Http404

    def add_ratings_records(self, username, playerid):
        try:
            player = self.get_player(playerid)
            newinit = InitRatingsOfPlayersForUsers(username=str(username), playerid=str(playerid), initrating=str(player.rating))
            newinit.save()
            newlastupdated = LastUpdatedRatingOfPlayersForUsers(username=str(username), playerid=str(playerid), lastupdated=str(player.rating))
            newlastupdated.save()
        except User.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        # print("REQUEST: ", request.data)
        # print("self: ", self)
        #print("pk: ", pk)
        user = self.get_object(pk)
        # print("user:", user)
        serializer = UserSerializer(user)
        # print("serializer.data:", serializer.data)
        p = recommend_player_to_user(user)
        # if p is None:
            #print("No recommendation")
        # else:
            #print(p.firstname, p.lastname, p.id)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        user = self.get_object(pk)
        user_players_init = []
        players_added = []
        players_removed = []
        prev_points = user.points
        new_balance = user.balance
        #print("request.data['players']:",request.data['players'])
        for p in user.players.all():
            user_players_init.append(p.id)
            if p.id not in request.data['players']:
                new_balance += p.price
                players_removed.append(p.id)
        for p in request.data['players']:
            if p not in user_players_init:
                new_balance -= self.get_player(p).price
                players_added.append(p)
                if new_balance < 0:
                    raise Http404

        #Update the counts of the players change db
        for p in players_added:
            player = self.get_player(p)
            player.count += 1
            player.save(update_fields = ['count'])
            # newinit = InitRatingsOfPlayersForUsers(data={'username':str(username), 'playerid':str(playerid), 'initrating':str(player.rating)})
            # newinit.save()
            # newlastupdated = LastUpdatedRatingOfPlayersForUsers(data={'username':str(username), 'playerid':str(playerid), 'initrating':str(player.rating)})
            # newlastupdated.save()
            # serializer = InitRatingsOfPlayersForUsersSerializer(data={'username':str(username), 'playerid':str(playerid), 'initrating':str(player.rating)})
            # if serializer.is_valid():
            #     serializer.save()
            # serializer = LastUpdatedRatingOfPlayersForUsersSerializer(data={'username':str(username), 'playerid':str(playerid), 'lastupdated':str(player.rating)})
            # if serializer.is_valid():
            #     serializer.save()
            self.add_ratings_records(user.username, p)

        for p in players_removed:
            player = self.get_player(p)
            player.count -= 1
            player.save(update_fields = ['count'])
            self.delete_ratings_records(user.username, p)

        serializer = UserSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            user.balance = new_balance
            user.save(update_fields = ['balance'])
            user.points = prev_points
            user.save(update_fields=['points'])
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PlayersListView(APIView):
    def get_player(self, pk):
        try:
            return Player.objects.get(pk=pk)
        except User.DoesNotExist:
            raise Http404

    def get(self, request, format=None):
        players = Player.objects.all()

        serializer = PlayerSerializer(players, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):

        with open("/Users/paulchung/Desktop/NCAA.csv") as f:
            reader = csv.reader(f)
            next(reader, None)
            for row in reader:

                name = row[1].split()
                #print(name)
                _, created = Player.objects.get_or_create(
                    firstname=name[0],
                    lastname=name[1],
                    position = row[2],
                    college = row[3],
                    ppg = row[4],
                    rpg = row[5],
                    apg = row[6],
                    bpg = row[7],
                    spg = row[8],
                    rating=0,
                    price=0,
                    count=0
                    )
            compute_final_rating()
        return Response(status=status.HTTP_201_CREATED)

        # serializer = PlayerSerializer(data=request.data)
        # if serializer.is_valid():
        #     serializer.save()
        #     compute_final_rating()
        #     player = self.get_player(serializer.data['id'])
        #     player.count = 0
        #     player.save(update_fields = ['count'])
        #     return Response(PlayerSerializer(player).data, status=status.HTTP_201_CREATED)
        # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PlayersDetailView(APIView):
    #Function for updating the user points
    def update_points(self, playerid):
        users = User.objects.all()
        for u in users:
            if u.players.filter(id = str(playerid)):
                lastRating = LastUpdatedRatingOfPlayersForUsers.objects.get(username=u.username, playerid=playerid)
                newRating = Player.objects.get(pk=playerid)
                newUserPoints = u.points + (newRating.rating-lastRating.lastupdated)
                #print(newUserPoints)
                u.points = newUserPoints
                u.save(update_fields = ['points'])
                lastRating.lastupdated = newRating.rating
                lastRating.save(update_fields = ['lastupdated'])

    def get_player(self, pk):
        try:
            return Player.objects.get(pk=pk)
        except User.DoesNotExist:
            raise Http404

    def get_object(self, pk):
        try:
            return Player.objects.get(pk=pk)
        except Player.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        player = self.get_object(pk)
        serializer = PlayerSerializer(player)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        player = self.get_object(pk)
        prev_count = player.count
        serializer = PlayerSerializer(player, data=request.data)
        if serializer.is_valid():
            serializer.save()
            compute_final_rating()
            self.update_points(player.id)
            player = self.get_player(serializer.data['id'])
            player.count = prev_count
            player.save(update_fields = ['count'])
            return Response(PlayerSerializer(player).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class NBAPlayersListView(APIView):
    def get(self, request, format=None):
        NBAplayers = NBAPlayer.objects.all()
        serializer = NBAPlayerSerializer(NBAplayers, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        # code below will initialize the NBA player database
        with open("/Users/paulchung/Desktop/nbaplayerdata.csv") as f:
            reader = csv.reader(f)
            next(reader, None)
            for row in reader:

                name = row[1].split()
                #print(name)
                _, created = NBAPlayer.objects.get_or_create(
                    firstname=name[0],
                    lastname=name[1],
                    position = row[2],
                    college = row[4],
                    ppg = row[3],
                    rpg = row[7],
                    apg = row[8],
                    bpg = row[11],
                    spg = row[10]
                    )
        return Response(status=status.HTTP_201_CREATED)

        #code below acts as normal post request
        # serializer = NBAPlayerSerializer(data=request.data)
        # if serializer.is_valid():
        #     serializer.save()
        #     compute_final_rating()
        #     return Response(serializer.data, status=status.HTTP_201_CREATED)
        # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class InitRatingsOfPlayersForUsersListView(APIView):
    def get(self, request, format=None):
        InitRatings = InitRatingsOfPlayersForUsers.objects.all()
        serializer = InitRatingsOfPlayersForUsersSerializer(InitRatings, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        serializer = InitRatingsOfPlayersForUsersSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LastUpdatedRatingOfPlayersForUsersListView(APIView):
    def get(self, request, format=None):
        LastRatings = LastUpdatedRatingOfPlayersForUsers.objects.all()
        serializer = LastUpdatedRatingOfPlayersForUsersSerializer(LastRatings, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        serializer = LastUpdatedRatingOfPlayersForUsersSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RecommendedPlayerView(APIView):
    def get_object(self, id):
        try:
            # print("in try:", User.objects.get(username="user1"))
            return User.objects.get(id=id)
        except User.DoesNotExist:
            raise Http404

    def post(self, request, format=None):
        if 'id' in request.data:
            user = self.get_object(request.data['id'])
            #print("----------")
            p = recommend_player_to_user(user)
            if p is None:
                #print("No player to recommend")
                raise Http404
            else:
                serializer = PlayerSerializer(p)
        else:
            raise Http404
        return Response(serializer.data)

class PlayerPercentagesView(APIView):

    def post(self, request, format=None):
        p =compute_final_rating()
        # print("---------------")
        # print(request.data)
        if 'id' in request.data:
            player = p[int(request.data['id'])]
            return JsonResponse(player, safe=False)
        raise Http404
        # print(p)
        # return Response(status=status.HTTP_201_CREATED)
        # percs = simplejson.dumps({"percentages" : compute_final_rating()})
        # return HttpResponse(percs, content_type ="application/json")
'''

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer

class PlayersListView(generics.ListCreateAPIView):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer

class PlayersDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
'''

# Create your views here.
