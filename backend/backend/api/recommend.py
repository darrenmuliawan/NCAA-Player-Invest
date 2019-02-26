from django.shortcuts import render
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
from django.db.models import Max
from django.db.models import Min
import pandas as pd
import numpy as np

#Priority for recommendations is as follows, 1. Player is on favorite team, 2. Pick highest rated on trending players
def players_to_consider(user):
    user_players_init = []
    players_to_consider = []
    for p in user.players.all():
        user_players_init.append(p.id)
        # if p.id not in request.data['players']:
        #     new_balance += p.price
        #     players_removed.append(p.id)
    players = Player.objects.filter(college=user.favoriteTeam)
    if players:
        for p in players:
            if p.id in user_players_init:
                continue
            else:
                players_to_consider.append(p)
            # print(p.firstname)
        if len(players_to_consider) > 0:
            return players_to_consider
    #players to consider are all players that user doesn't own
    for p in Player.objects.all():
        if p.id not in user_players_init:
            players_to_consider.append(p)
    return players_to_consider

# def get_player(pk):
#     try:
#         return Player.objects.get(pk=pk)
#     except User.DoesNotExist:
#         raise Http404

def recommend_player_to_user(user):
    players = players_to_consider(user)
    #print("After players to consider")
    #Each player associated with a number. Every user that owns the player and has gained
    #points will increment the number of the player in the dict. Otherwise, decrement.
    #Then choose the highest rating in the top 5 trending
    player_slope_dict = {}
    #print(players)
    for p in players:
        #print(p.firstname)
        player_slope_dict[p] = 0
        users = User.objects.all()
        for u in users:
            if u.players.filter(id=str(p.id)):
                #print("before")
                init_rating = InitRatingsOfPlayersForUsers.objects.get(username=u.username, playerid=p.id)
                #print("after")
                curr_rating = p.rating
                if curr_rating - init_rating.initrating > 0:
                    if p not in player_slope_dict:
                        player_slope_dict[p] = 1
                    else:
                        player_slope_dict[p] += 1
                else:
                    if p not in player_slope_dict:
                        player_slope_dict[p] = -1
                    else:
                        player_slope_dict[p] -= 1
    #print("player_slope_dict:", player_slope_dict)
    sorted_by_value = sorted(player_slope_dict.items(), key=lambda kv: kv[1], reverse=True)
    #print("sorted_by_value:",sorted_by_value)
    top_5 = []
    for i, (k,v) in enumerate(sorted_by_value):
        player_to_recommend = k
        max_rating_local = 0
        if (i+1)%6==0:
            max_rating_local = 0
            for p in top_5:
                #print("pid = ", p.id)
                #print("prating = ", p.rating)
                if p.rating > max_rating_local:
                    #print("pid in if",p.id)
                    player_to_recommend = p
                    max_rating_local = p.rating
            #print("returned here")
            #print("pid = ", p.id)
            #print("top_5=",top_5)
            return player_to_recommend
        else:
            top_5.append(k)
    #if less than 5 players in top five, return here
    max_rating_local = 0
    result = []
    for p in top_5:
        if p.rating > max_rating_local:
            result.append(p)
            max_rating_local = p.rating
    #print("result here = ", result)
    if not result:
        return None
    else:
        return result[len(result)-1]
