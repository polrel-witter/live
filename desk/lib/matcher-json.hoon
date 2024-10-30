/-  *matcher, live
|%
::
++  dejs-deed
  =,  dejs:format
  |=  jon=json
  |^  ^-  deed
  %.  jon
  %-  of
  :~  edit-profile+(ot ~[term+(se %tas) entry+so:dejs-soft:format])
      shake+de-shake
      add-pals+bo
  ==
  ::
  ++  de-shake
    %-  ot
    :~  id+(ot ~[ship+(se %p) name+(se %tas)])
        ship+(se %p)
        act+bo
    ==
  --
::
++  en-fields
  =,  enjs:format
  |=  a=(list [term entry])
  ^-  ^json
  :-  %a
  %+  turn  a
  |=  [=term =entry]
  %-  pairs
  :~  ['term' s+(scot %tas term)]
      ['entry' ?~(entry ~ s+u.entry)]
  ==
::
++  enjs-update
  =,  enjs:format
  |=  upd=update
  ^-  ^json
  ?-    -.upd
      %add-pals  (frond ['addPals' b+p.upd])
      %match
    %-  pairs
    :~  ['ship' s+(scot %p ship.upd)]
        ['match' ?~(status.upd ~ s+(scot %tas u.status.upd))]
    ==
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
  |=  =demand
  |^  ^-  ^json
  ~|  "{<-.demand>} conversion not supported"
  %-  frond
  ?-    -.demand
      %peer-status  !!
      %matches      !!
      %reaches      !!
      %add-pals     ['addPals' b+p.demand]
      %peers        ['peers' (en-peers p.demand)]
      %profile      ['profile' (en-profile p.demand)]
      %profiles     ['allProfiles' (en-all-profiles p.demand)]
  ==
  ::
  ++  en-peers
    |=  a=(map @p status)
    ^-  json
    :-  %o
    %-  malt
    ^-  (list [cord ^json])
    %+  turn  ~(tap by a)
    |=  [who=@p =status]
    :-  (scot %p who)
    (frond ['status' ?~(status ~ s+(scot %tas u.status))])
  ::
  ++  en-profile
    |=  a=(map term entry)
    ^-  json
    :-  %o
    %-  malt
    ^-  (list [cord ^json])
    %+  turn  ~(tap by a)
    |=  [=term =entry]
    :-  (scot %tas term)
    (frond ['entry' `json`?~(entry ~ s+u.entry)])
  ::
  ++  en-all-profiles
    |=  a=(map @p (list [term entry]))
    ^-  json
    :-  %o
    %-  malt
    ^-  (list [cord ^json])
    %+  turn  ~(tap by a)
    |=  [who=@p fields=(list [term entry])]
    :-  (scot %p who)
    (en-fields fields)
  --
--
