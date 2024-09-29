/-  *matcher, live
|%
::
++  dejs-deed
  =,  dejs:format
  |=  jon=json
  |^  ^-  deed
  %.  jon
  %-  of
  :~  [%edit-profile (ot ~[term+(se %tas) entry+so:dejs-soft:format])]
      [%shake de-shake]
  ==
  ::
  ++  de-shake
    %-  ot
    :~  (ot ~[ship+(se %p) name+(se %tas)])
        ship+(se %p)
        act+bo
    ==
  --
::
++  enjs-update
  =,  enjs:format
  |=  upd=update
  ^-  ^json
  ?-    -.upd
      %match
    (frond ['match' b+p.upd])
  ::
      %profile
    %-  pairs
    :~  ['ship' s+(scot %p ship.upd)]
        ['fields' (en-fields fields.upd)]
    ==
  ==
::
++  enjs-demand
  =,  enjs:format
  |=  dem=demand
  |^  ^-  ^json
  ~|  "{<(scot %tas -.dem)>} conversion not supported"
  ?-    -.dem
      %peer-status  !!
      %matches      !!
      %reaches      !!
      %peers     (frond ['peers' (en-peers p.dem)])
      %profile   (frond ['profile' (en-profile p.dem)])
      %profiles  (frond ['allProfiles' (en-all-profiles p.dem)])
  ==
  ::
  ++  en-peers
    |=  a=(map ship status)
    ^-  json
    ?~  a  ~
    :-  %o
    %-  malt
    ^-  (list [cord ^json])
    %+  turn  ~(tap by a)
    |=  [=ship =status]
    :-  (scot %p ship)
    (frond ['status' ?~(status ~ s+(scot %tas u.status))])
  ::
  ++  en-profile
    |=  a=(map term entry)
    ^-  json
    ?~  a  ~
    :-  %o
    %-  malt
    ^-  (list [cord ^json])
    %+  turn  ~(tap by a)
    |=  [=term =entry]
    :-  (scot %tas term)
    (frond ['entry' `json`?~(entry ~ s+u.entry)])
  ::
  ++  en-all-profiles
    |=  a=(map ship (list [term entry]))
    ^-  json
    ?~  a  ~
    :-  %o
    %-  malt
    ^-  (list [cord ^json])
    %+  turn  ~(tap by a)
    |=  [=ship fields=(list [term entry])]
    :-  (scot %p ship)
    (en-fields fields)
  --
::
++  en-fields
  |=  a=(list [term entry])
  ^-  ^json
  :-  %a
  %-  turn  a
  |=  [=term =entry]
  %-  pairs
  :~  ['term' s+(scot %tas term)]
      ['entry' ?~(entry ~ s+u.entry)]
  ==
--
