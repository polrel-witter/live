/-  *live
|%
++  enjs-update
  =,  enjs:format
  |=  upd=update
  |^  ^-  json
  ?-    -.upd
      %record-status
    %-  pairs
    :~  ['id' (en-id id.upd)]
        ['ship' s+(scot %p ship.upd)]
        ['record-status' (en-status status.upd)]
    ==
  ==
  ::
  ++  en-id
    |=  a=id
    ^-  ^json
    %-  pairs
    :~  ['ship' s+(scot %p ship.a)]
        ['name' s+(scot %tas name.a)]
    ==
  ::
  ++  en-status
    |=  a=status
    ^-  ^json
    %-  pairs
    :~  ['p' s+(scot %tas p.a)]
        ['q' s+(sect q.a)]
    ==
  --
--
