::  %matcher's peer state replication, controlled by event host
::
|%
++  name  %live-peers
+$  rock  guests=(set ship)
+$  wave
  $%  [%add-peer =ship]
      [%delete-peer =ship]
  ==
++  wash
  |=  [=rock =wave]
  ?-  -.wave
    %add-peer     (~(put in guests.rock) ship.wave)
    %delete-peer  (~(del in guests.rock) ship.wave)
  ==
--
