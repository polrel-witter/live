/-  *live
/+  *mip
|%
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
  |=  dem=demand
  ^-  ^json
  ~|  "{<(scot %tas -.dem)>} conversion not supported"
  ?-    -.dem
      %event-exists   !!
      %record-exists  !!
      %event          !!
      %counts         !!
      %all-events     !!
      %event-records  !!
      %remote-events  !!
      %all-records  (frond ['allRecords' (en-all-records p.dem)])
      %record
    %-  frond
    :-  'record'
    ?~  p.dem  ~
    (en-record u.p.dem)
  ==
::
++  en-id
  |=  a=id
  ^-  ^json
  %-  pairs:enjs:format
  :~  ['ship' s+(scot %p ship.a)]
      ['name' s+(scot %tas name.a)]
  ==
::
++  en-all-records
  |=  a=(mip id ship record-1)
  ^-  json
  ?~  a  ~
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
  :-  (crip :(weld (scow %p ship.id) " " (scow %tas name.id)))
  :-  %o
  %-  malt
  ^-  (list [cord ^json])
  %+  turn  ~(tap by (~(got by a) id))
  |=  [=ship rec=record-1]
  :-  (scot %p ship)
  (frond:enjs:format ['record' (en-record rec)])
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
  ++  en-unit-cord
    |=  a=(unit cord)
    ^-  json
    ?~(a ~ s+u.a)
  ::
  ++  en-status
    |=  a=status
    ^-  ^json
    %-  pairs
    :~  ['p' s+(scot %tas p.a)]
        ['q' s+(sect q.a)]
    ==
  ::
  ++  en-info-1
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
      ?~  a  ~
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
--
