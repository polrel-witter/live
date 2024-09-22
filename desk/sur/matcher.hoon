::  %matcher: %live's social networking agent
::    version ~2024.09.18
::    ~polrel-witter
::
/-  live
|%
::  $status: peer matching status
::
+$  status  (unit ?(%match %reach))
::  $stage: host validation status
::
+$  stage  (unit ?(%confirmed %sent))
::  $entry: profile field
::
+$  entry  (unit cord)
::  $dictum: host only action
::
+$  dictum
  $:  =id:live
      $%  [%add-peer =ship]       :: add guest to peer list
          [%delete-peer =ship]    :: remove guest from state
          [%show =ship =status]   :: reveal peer status
          [%subscribe ~]          :: request from host to sub to guest list updates
      ==
  ==
::  $deed: host or guest action
::
+$  deed
  $%  [%edit-profile =term =entry]     :: edit profile
      [%shake =id:live =ship =status]  :: initiate a new peer status
  ==
--
