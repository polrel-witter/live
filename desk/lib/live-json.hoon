/-  *live
/+  *mip
|%
::
++  dejs-operation
  =,  dejs:format
  |=  jon=json
  |^  ^-  operation
  %.  jon
  %-  ot
  :~  id+(ot ~[ship+(se %p) name+(se %tas)])
      action+de-action
  ==
  ::
  ++  de-action
    ^-  $-(json action)
    %-  of
    :~  create+de-event-1
        delete+ul
        info+de-sub-info-1
        secret+de-unit-cord
        limit+ni:dejs-soft:format
        subscribe+ul
        invite+(ar (se %p))
        register+de-unit-ship
        unregister+de-unit-ship
        punch+de-punch
    ==
  ::
  ++  de-unit-ship
    ^-  $-(json (unit ship))
    (su:dejs-soft:format ;~(pfix sig fed:ag))
  ::
  ++  de-punch
    %-  ot
    :~  act+(su (perk %verify %revoke ~))
        ship+(se %p)
    ==
  ::
  ++  de-kind  (su (perk %public %private %secret ~))
  ::
  ++  de-latch  (su (perk %open %closed %over ~))
  ::
  ++  de-sub-info-1
    ^-  $-(json sub-info-1)
    %-  of
    :~  title+so
        about+de-unit-cord
        moment+de-moment-1
        timezone+(ot ~[p+bo q+(se %ud)])
        location+de-unit-cord
        venue-map+de-unit-cord
        group+de-group
        kind+de-kind
        latch+de-latch
        create-session+(ot dl-session)
        edit-session+(ot ~[p+(se %tas) q+(of dl-session)])
        delete-session+(se %tas)
    ==
  ::
  ++  de-info-1
    ^-  $-(json info-1)
    %-  ot
    :~  title+so
        about+de-unit-cord
        moment+de-moment-1
        timezone+(ot ~[p+bo q+(se %ud)])
        location+de-unit-cord
        venue-map+de-unit-cord
        group+de-group
        kind+de-kind
        latch+de-latch
        sessions+(op sym ^-($-(json session) (ot dl-session)))
    ==
  ::
  ++  de-unit-cord  so:dejs-soft:format
  ::
  ++  de-moment-1
    ^-  $-(json moment-1)
    %-  ot
    :~  start+da:dejs-soft:format
        end+da:dejs-soft:format
    ==
  ::
  ++  de-group
    |^  ^-  $-(json group)
        (su:dejs-soft:format ;~((glue fas) ship ^sym))
    ::
    ++  sym   (se %tas)
    ++  ship  ;~(pfix sig fed:ag)
    --
  ::
  ++  dl-session
    :~  title+so
        panel+de-unit-cord
        location+de-unit-cord
        about+de-unit-cord
        moment+de-moment-1
    ==
  ::
  ++  de-event-1
    ^-  $-(json event-1)
    %-  ot
    :~  info+de-info-1
        secret+de-unit-cord
        limit+ni:dejs-soft:format
    ==
  --
::
++  enjs-update
  =,  enjs:format
  |=  upd=update
  ^-  ^json
  ?-    -.upd
      %record
    %-  pairs
    :~  ['id' (en-id id.upd)]
        ['ship' s+(scot %p ship.upd)]
        ['record' (en-record record.upd)]
    ==
  ==
::
++  enjs-demand
  =,  enjs:format
  |=  =demand
  ^-  ^json
  ~|  "{<-.demand>} conversion not supported"
  ?-    -.demand
      %event-exists   !!
      %record-exists  !!
      %event          !!
      %session-ids    !!
      %counts         !!
      %event-records  !!
      %remote-events  !!
      %all-events   (frond ['allEvents' (en-all-events p.demand)])
      %all-records  (frond ['allRecords' (en-all-records p.demand)])
      %record       (frond ['record' ?~(p.demand ~ (en-record u.p.demand))])
  ==
::
++  en-unit-cord
  |=  a=(unit cord)
  ^-  json
  ?~(a ~ s+u.a)
::
++  en-id
  |=  a=id
  ^-  ^json
  %-  pairs:enjs:format
  :~  ['ship' s+(scot %p ship.a)]
      ['name' s+(scot %tas name.a)]
  ==
::
++  en-record
  =,  enjs:format
  |=  a=record-1
  |^  ^-  ^json
  %-  pairs
  :~  ['info' (en-info-1 info.a)]
      ['secret' (en-unit-cord secret.a)]
      ['status' (en-status status.a)]
  ==
  ::
  ++  en-status
    |=  a=status
    ^-  ^json
    %-  pairs
    :~  ['p' s+(scot %tas p.a)]
        ['q' (time q.a)]
    ==
  --
::
++  en-all-events
  |=  a=(map id event-1)
  |^  ^-  json
  :-  %o
  %-  malt
  ^-  (list [cord ^json])
  %+  turn  ~(tap by a)
  |=  [=id eve=event-1]
  :-  (crip :(weld (scow %p ship.id) "/" (scow %tas name.id)))
  (frond:enjs:format ['event' (en-event eve)])
  ::
  ++  en-event
    =,  enjs:format
    |=  a=event-1
    ^-  ^json
    %-  pairs
    :~  ['info' (en-info-1 info.a)]
        ['secret' (en-unit-cord secret.a)]
        ['limit' `json`?~(limit.a ~ (numb u.limit.a))]
    ==
  --
::
++  en-all-records
  |=  a=(mip id ship record-1)
  ^-  json
  =/  ids=(list id)
    ~(tap in ~(key by a))
  :-  %o
  %-  malt
  ^-  (list [cord ^json])
  %+  turn  ids
  |=  =id
  ::  convert the id to a single cord for the object map, and nest
  ::  the records map as an object within
  ::
  :-  (crip :(weld (scow %p ship.id) "/" (scow %tas name.id)))
  :-  %o
  %-  malt
  ^-  (list [cord ^json])
  %+  turn  ~(tap by (~(got by a) id))
  |=  [=ship rec=record-1]
  :-  (scot %p ship)
  (frond:enjs:format ['record' (en-record rec)])
::
++  en-info-1
  =,  enjs:format
  |=  a=info-1
  |^  ^-  ^json
  %-  pairs
  :~  ['title' s+title.a]
      ['about' (en-unit-cord about.a)]
      ['moment' (en-moment-1 moment.a)]
      ['timezone' (en-timezone timezone.a)]
      ['location' (en-unit-cord location.a)]
      ['venue-map' (en-unit-cord venue-map.a)]
      ['group' (en-group group.a)]
      ['kind' s+(scot %tas kind.a)]
      ['latch' s+(scot %tas latch.a)]
      ['sessions' (en-all-sessions sessions.a)]
  ==
  ::
  ++  en-group
    |=  a=group
    ^-  json
    ?~  a  ~
    %-  pairs
    :~  ['ship' s+(scot %p p.u.a)]
        ['term' s+(scot %tas q.u.a)]
    ==
  ::
  ++  en-timezone
    |=  a=timezone
    ^-  ^json
    %-  pairs
    :~  ['p' b+p.a]
        ['q' (numb q.a)]
    ==
  ::
  ++  en-moment-1
    |=  a=moment-1
    ^-  ^json
    %-  pairs
    :~  ['start' ?~(start.a ~ (sect u.start.a))]
        ['end' ?~(end.a ~ (sect u.end.a))]
    ==
  ::
  ++  en-all-sessions
    |=  a=(map term session)
    ^-  json
    :-  %o
    %-  malt
    ^-  (list [cord ^json])
    %+  turn  ~(tap by a)
    |=  [=term =session]
    :-  (scot %tas term)
    (frond:enjs:format ['session' (en-session session)])
  ::
  ++  en-session
    |=  a=session
    ^-  ^json
    %-  pairs
    :~  ['title' s+title.a]
        ['panel' (en-unit-cord panel.a)]
        ['location' (en-unit-cord location.a)]
        ['about' (en-unit-cord about.a)]
        ['moment' (en-moment-1 moment.a)]
    ==
  --
--
