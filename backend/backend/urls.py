from django.conf.urls import url, include
from rest_framework import routers
from backend.api import views
from django.contrib import admin
from django.urls import path


urlpatterns = [
    url(r'^users/(?P<pk>[0-9]+)/$', views.UserDetailView.as_view()),
    url(r'^users/', views.UserListView.as_view()),
    url(r'^login/', views.UserLogin.as_view()),
    url(r'^players/(?P<pk>[0-9]+)/$', views.PlayersDetailView.as_view()),
    url(r'^players/', views.PlayersListView.as_view()),
    url(r'^NBAplayers/', views.NBAPlayersListView.as_view()),
    url(r'^InitRatings/', views.InitRatingsOfPlayersForUsersListView.as_view()),
    url(r'^LastUpdatedRatings/', views.LastUpdatedRatingOfPlayersForUsersListView.as_view()),
    url(r'^Recommend/', views.RecommendedPlayerView.as_view()),
    url(r'^playerPercentages/', views.PlayerPercentagesView.as_view())
]


'''url(r'^users/(?P<pk>[0-9]+)/$', views.UserDetailView.as_view()),
    url(r'^players/(?P<pk>[0-9]+)/$', views.PlayersDetailView.as_view()),
    url(r'^players/', views.PlayersListView.as_view()),
'''
