::  %matcher: %live's social networking agent
::    version ~2024.09.18
::    ~polrel-witter
::
/-  live
|%
::  $status: peer matching status
::
+$  status  (unit ?(%match %reach))
::  $entry: profile field
::
+$  entry  (unit cord)
::  $dictum: host only action
::
+$  dictum
  $:  =id:live
      $%  [%add-peer =ship]       :: add guest to peer list
          [%delete-peer =ship]    :: remove guest from state
          [%show =ship =status]   :: updated peer status; from host
          [%subscribe ~]          :: request from host to sub to guest list updates
      ==
  ==
::  $deed: host or guest action
::
+$  deed
  $%  [%profile-diff p=(map term entry)]     :: update peer profile
      [%edit-profile =term =entry]           :: edit profile
      [%shake =id:live =ship act=?]          :: initiate a new peer status
  ==
::  $update: local subscription changes
::
+$  update
  $%  [%match =ship =status]                       :: match change
      [%profile =ship fields=(list [term entry])]  :: profile change
  ==
::  $demand: scry api
::
+$  demand
  $%  [%profile p=(map term entry)]                 :: a profile
      [%profiles p=(map ship (list [term entry]))]  :: all profiles
      [%peer-status p=status]                       :: peer status
      [%peers p=(map ship status)]                  :: peer statuses by event
      [%matches p=(map ship (list ship))]           :: all matches for an event
      [%reaches p=(map ship (list ship))]           :: all reaches for an event
  ==
--
