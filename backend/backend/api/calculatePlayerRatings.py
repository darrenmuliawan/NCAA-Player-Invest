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

def compute_scalar(pos):
    checker = NBAPlayer.objects.filter(position=pos)

    pts_av = checker.aggregate(Avg('ppg'))['ppg__avg']
    asts_av = checker.aggregate(Avg('apg'))['apg__avg']
    rebs_av = checker.aggregate(Avg('rpg'))['rpg__avg']
    stls_av = checker.aggregate(Avg('spg'))['spg__avg']
    blcks_av = checker.aggregate(Avg('bpg'))['bpg__avg']

    output = np.array([pts_av, asts_av, rebs_av, stls_av, blcks_av])
    return output

def compute_frequency():
    checker = Player.objects.values_list('count', flat=True)
    sum_ = 0
    for i in checker:
        sum_ += float(i)**2

    #root mean squared is the measure of the typical magnitude of a set of numbers
    rms_ = sum_**(1./2)
    result = {}
    for player in Player.objects.all():
        if rms_ != 0 and float(player.count) != 0:
            result[str(player.id)] = (float(player.count)/rms_)+1

    #dictionary of ncaaplayer name as key and value is offset from count for player rating
    return result

def compute_college():
    # df1 = df.where((pd.notnull(df)), None)
    checker = NBAPlayer.objects.values_list('college', flat=True)
    d = {}
    l = list(checker)
    for i in l:
        if not i:
            continue
        if i not in d:
            d[i] = 1
        else:
            d[i] +=1

    vals = d.values()
    # print(d)
    sum_ = 0
    for i in vals:
        sum_ += i**2
    divisor = sum_**(1./2)
    result = {}
    for key, value in d.items():
        result[key] = (value/divisor)+1
    # print(result)
    return result

def helper(pos, player):
    scalars = compute_scalar(pos)

    #Weights sum to 1
    G_weights = {'points':0.4, 'assists':0.3, 'rebounds':0.1, 'steals':0.15, 'blocks':0.05}
    F_weights = {'points':0.3, 'assists':0.25, 'rebounds':0.25, 'steals':0.1, 'blocks':0.1}
    C_weights = {'points':0.25, 'assists':0.1, 'rebounds':0.4, 'steals':0.05, 'blocks':0.2}
    weights_positions = {'G':G_weights, 'F':F_weights, 'C':C_weights}
    weights = weights_positions[pos]

    NBAplayers = NBAPlayer.objects.filter(position=pos)
    players = Player.objects.filter(position=pos)

    for s in scalars:
        if s == 0:
            s = 0.1

    #print(scalars)
    points = (float(player.ppg)*float(scalars[0]))
    max_ppg_ncaa = float(players.aggregate(Max('ppg'))['ppg__max'])+1
    #print("max_ppg_ncaa:", max_ppg_ncaa)
    min_ppg_ncaa = 0 #float(players.aggregate(Min('ppg'))['ppg__min'])
    # max_ppg_nba = float(NBAplayers.aggregate(Max('ppg'))['ppg__max'])
    # min_ppg_nba = float(NBAplayers.aggregate(Min('ppg'))['ppg__min'])
    # if max_ppg_nba == 0:
    #     max_ppg_nba = 0.1
    # if min_ppg_nba == 0:
    #     min_ppg_nba = 0.1
    # print(scalars)
    # print("(float(max_ppg_ncaa/scalars[0]) - float(min_ppg_ncaa/scalars[0]))", (float(max_ppg_ncaa/scalars[0]) - float(min_ppg_ncaa/scalars[0])))
    # points = weights['points']*((100-0)/(float(max_ppg_ncaa/scalars[0]) - float(min_ppg_ncaa/scalars[0])) * (points - float(max_ppg_ncaa/scalars[0])) + 100)
    points = weights['points']*((100-0)/(float(max_ppg_ncaa*float(scalars[0])) - float(min_ppg_ncaa*float(scalars[0]))) * (points - float(max_ppg_ncaa*float(scalars[0]))) + 100)

    assists = (float(player.apg)*float(scalars[1]))
    max_apg_ncaa = float(players.aggregate(Max('apg'))['apg__max'])+1
    #print("max_apg_ncaa",max_apg_ncaa)
    min_apg_ncaa = 0 #float(players.aggregate(Min('apg'))['apg__min'])
    # max_apg_nba = float(NBAplayers.aggregate(Max('apg'))['apg__max'])
    # min_apg_nba = float(NBAplayers.aggregate(Min('apg'))['apg__min'])
    # if max_apg_nba == 0:
    #     max_apg_nba = 0.1
    # if min_apg_nba == 0:
    #     min_apg_nba = 0.1
    # assists = weights['assists']*((100-0)/(float(max_apg_ncaa/scalars[1]) - float(min_apg_ncaa/scalars[1])) * (assists - float(max_apg_ncaa/scalars[1])) + 100)
    assists = weights['assists']*((100-0)/(float(max_apg_ncaa*float(scalars[1])) - float(min_apg_ncaa*float(scalars[1]))) * (assists - float(max_apg_ncaa*float(scalars[1]))) + 100)

    rebounds = (float(player.rpg)*float(scalars[2]))
    max_rpg_ncaa = float(players.aggregate(Max('rpg'))['rpg__max'])+1
    min_rpg_ncaa = 0 #float(players.aggregate(Min('rpg'))['rpg__min'])
    # max_rpg_nba = float(NBAplayers.aggregate(Max('rpg'))['rpg__max'])
    # min_rpg_nba = float(NBAplayers.aggregate(Min('rpg'))['rpg__min'])
    # if max_rpg_nba == 0:
    #     max_rpg_nba = 0.1
    # if min_rpg_nba == 0:
    #     min_rpg_nba = 0.1
    rebounds = weights['rebounds']*((100-0)/(float(max_rpg_ncaa*float(scalars[2])) - float(min_rpg_ncaa*float(scalars[2]))) * (rebounds - float(max_rpg_ncaa*float(scalars[2]))) + 100)

    steals = (float(player.spg)*float(scalars[3]))
    max_spg_ncaa = float(players.aggregate(Max('spg'))['spg__max'])+1
    min_spg_ncaa = 0 #float(players.aggregate(Min('spg'))['spg__min'])
    # max_spg_nba = float(NBAplayers.aggregate(Max('spg'))['spg__max'])
    # min_spg_nba = float(NBAplayers.aggregate(Min('spg'))['spg__min'])
    # if max_spg_nba == 0:
    #     max_spg_nba = 0.1
    # if min_spg_nba == 0:
    #     min_spg_nba = 0.1
    steals = weights['steals']*((100-0)/(float(max_spg_ncaa*float(scalars[3])) - float(min_spg_ncaa*float(scalars[3]))) * (steals - float(max_spg_ncaa*float(scalars[3]))) + 100)

    blocks = (float(player.bpg)*float(scalars[4]))
    max_bpg_ncaa = float(players.aggregate(Max('bpg'))['bpg__max'])+1
    min_bpg_ncaa = 0 #float(players.aggregate(Min('bpg'))['bpg__min'])
    # max_bpg_nba = float(NBAplayers.aggregate(Max('bpg'))['bpg__max'])
    # min_bpg_nba = float(NBAplayers.aggregate(Min('bpg'))['bpg__min'])
    # if max_bpg_nba == 0:
    #     max_bpg_nba = 0.1
    # if min_bpg_nba == 0:
    #     min_bpg_nba = 0.1
    # print("Blocks:", blocks)
    blocks = weights['blocks']*((100-0)/(float(max_bpg_ncaa*float(scalars[4])) - float(min_bpg_ncaa*float(scalars[4]))) * (blocks - float(max_bpg_ncaa*float(scalars[4]))) + 100)
    # print(float(max_bpg_ncaa/min_bpg_nba))
    #print("---------")
    #print(player.firstname)
    #print("points:", points)
    #print("assists:", assists)
    #print("rebounds:", rebounds)
    #print("steals:", steals)
    #print("blocks:", blocks)
    #print("---------")
    rating = points + assists + rebounds + steals + blocks
    return rating, [100*float(points)/rating, 100*float(assists)/rating, 100*float(rebounds)/rating, 100*float(steals)/rating, 100*float(blocks)/rating]

def compute_final_rating():
    college_scalars = compute_college()
    freqs = compute_frequency()
    ratings = {}
    percentages = {}
    for player in Player.objects.all():
        rating, perc = helper(player.position, player)
        if player.college in college_scalars:
            rating *= college_scalars[player.college]
            perc.append(college_scalars[player.college])
        else:
            perc.append(0)
        if str(player.id) in freqs:
            rating *= freqs[str(player.id)]
            perc.append(freqs[str(player.id)])
        else:
            perc.append(1)
        ratings[player.id] = rating
        percentages[player.id] = perc

    prices = {}
    max_ratings = max(ratings.values())+1
    min_ratings = min(ratings.values())


    for k, v in ratings.items():
        # temp = (96-50)/(max_ratings - min_ratings) * (v - max_ratings) + 96
        # temp = int(round(temp))
        temp = (500-5)/(float(max_ratings) - float(min_ratings)) * (float(v) - float(max_ratings)) + 500
        #print("temp:", temp)
        #print(type(temp))
        temp = int(round(temp))
        prices[k] = temp

    for player in Player.objects.all():
        player.rating = ratings[player.id]
        player.save(update_fields = ['rating'])
        player.price = prices[player.id]
        player.save(update_fields = ['price'])

    # print(percentages)
    return percentages
