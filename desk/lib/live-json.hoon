/-  *live
/+  *mip
|%
::
++  dejs-dial
  =,  dejs:format
  |=  jon=json
  |^  ^-  dial
  %.  jon
  %-  of
  :~  find+(ot ~[ship+(se %p) name+de-unit-term])
      case-request+de-unit-term
      case-response+(ot ~[case+ni:dejs-soft:format name+de-unit-term])
  ==
  ++  de-unit-term  (su:dejs-soft:format sym)
  --
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
  ++  de-kind  (su (perk ~[%public %private %secret]))
  ::
  ++  de-latch  (su (perk ~[%open %closed %over]))
  ::
  ++  de-sub-info-1
    ^-  $-(json sub-info-1)
    %-  of
    :~  title+so
        about+de-unit-cord
        moment+de-moment-1
        timezone+(ot ~[p+bo q+ni])
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
        timezone+(ot ~[p+bo q+ni])
        location+de-unit-cord
        venue-map+de-unit-cord
        group+de-group
        kind+de-kind
        latch+de-latch
        sessions+de-sessions
    ==
  ::
  ++  de-unit-cord  so:dejs-soft:format
  ::
  ++  de-moment-1
    ^-  $-(json moment-1)
    %-  ot
    :~  start+di:dejs-soft:format
        end+di:dejs-soft:format
    ==
  ::
  ++  de-group
    |^  ^-  $-(json group)
        (su:dejs-soft:format ;~((glue fas) ship sym))
    ::
    ++  ship  ;~(pose ;~(pfix sig fed:ag) fed:ag)
    ++  sym
      %+  cook
        |=  a=tape
        ^-  term
        =.  a  (cass a)
        =.  a  (turn a |=(c=@t ?:(|(=('.' c) =(' ' c)) '-' c)))
        ?.  ((sane %tas) (crip a))  ~|(%bad-term !!)
        (slav %tas (crip a))
      ;~(pose (plus ;~(pose alp dot ace)))
    --
  ::
  ++  dl-session
    :~  title+so
        panel+de-panel
        location+de-unit-cord
        about+de-unit-cord
        moment+de-moment-1
    ==
  ::
  ++  de-sessions
    |=  jon=json
    ^-  (map term session)
    ?>  ?=([%a *] jon)
    =/  a=(list session)
      ((ar (ot dl-session)) jon)
    =|  i=@ud
    =|  b=(list [term session])
    |-  ?~  a  (malt b)
    $(b [[(slav %tas (crip "s{<i>}")) i.a] b], i +(i), a t.a)
  ::
  ++  de-panel
    |=  jon=json
    ^-  (unit cord)
    ?>  ?=([%a *] jon)
    =-  ?~(- ~ `(crip (join ', ' -)))
    ^-  tape
    %+  turn  p.jon
    |=  j=json
    ?>  ?=([%s *] j)
    p.j
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
  %-  pairs
  ?-    -.upd
      %record
    :~  ['id' (en-id id.upd)]
        ['ship' s+(scot %p ship.upd)]
        ['record' (en-record record.upd)]
    ==
  ::
      %event
    :~  ['id' (en-id id.upd)]
        ['event' (en-event `event.upd)]
    ==
  ::
      %result
    :~  ['ship' s+(scot %p ship.upd)]
        ['name' `json`?~(name.upd ~ s+u.name.upd)]
        ['result' (en-result result.upd)]
    ==
  ==
::
++  enjs-demand
  |=  =demand
  ^-  ^json
  ~|  "{<-.demand>} conversion not supported"
  %-  frond:enjs:format
  ?-    -.demand
      %event-exists   ['eventExists' b+p.demand]
      %record-exists  ['recordExists' b+p.demand]
      %event          ['event' (en-event p.demand)]
      %session-ids    ['sessionIds' (en-session-ids p.demand)]
      %record         ['record' ?~(p.demand ~ (en-record u.p.demand))]
      %counts         ['counts' (en-counts p.demand)]
      %all-events     ['allEvents' (en-all-events p.demand)]
      %all-records    ['allRecords' (en-all-records p.demand)]
      %event-records  ['records' (en-records p.demand)]
      %remote-events  ['remoteEvents' (en-remote-events p.demand)]
      %result         ['result' (en-result p.demand)]
  ==
::
++  en-result
  |=  a=$@(@t (map id info-1))
  ^-  ^json
  ?@  a  [%s ;;(cord a)]
  (en-remote-events a)
::
++  en-unit-cord
  |=  a=(unit cord)
  ^-  json
  ?~(a ~ s+u.a)
::
++  id-to-cord
  |=  =id
  ^-  cord
  (crip :(weld (scow %p ship.id) "/" (scow %tas name.id)))
::
++  en-id
  |=  a=id
  ^-  ^json
  %-  pairs:enjs:format
  :~  ['ship' s+(scot %p ship.a)]
      ['name' s+(scot %tas name.a)]
  ==
::
++  en-counts
  =,  enjs:format
  |=  a=(map stage @ud)
  ^-  ^json
  :-  %o
  %-  malt
  ^-  (list [cord ^json])
  %+  turn  ~(tap by a)
  |=  [s=stage c=@ud]
  :-  (scot %tas s)
  (frond ['count' (numb c)])
::
++  en-session-ids
  |=  a=(list [term cord])
  ^-  ^json
  :-  %a
  ^-  (list ^json)
  %+  turn  a
  |=  [t=term c=cord]
  %-  pairs:enjs:format
  :~  ['sessionId' s+(scot %tas t)]
      ['sessionTitle' s+c]
  ==
::
++  en-remote-events
  |=  a=(map id info-1)
  ^-  ^json
  :-  %o
  %-  malt
  ^-  (list [cord ^json])
  %+  turn  ~(tap by a)
  |=  [=id i=info-1]
  :-  (id-to-cord id)
  (frond:enjs:format ['info' (en-info i)])
::
++  en-event
  =,  enjs:format
  |=  a=(unit event-1)
  ^-  ^json
  ?~  a  ~
  %-  pairs
  :~  ['info' (en-info info.u.a)]
      ['secret' (en-unit-cord secret.u.a)]
      ['limit' `json`?~(limit.u.a ~ (numb u.limit.u.a))]
  ==
::
++  en-all-events
  |=  a=(map id event-1)
  ^-  json
  :-  %o
  %-  malt
  ^-  (list [cord ^json])
  %+  turn  ~(tap by a)
  |=  [=id e=event-1]
  :-  (id-to-cord id)
  (frond:enjs:format ['event' (en-event `e)])
::
++  en-record
  =,  enjs:format
  |=  a=record-1
  |^  ^-  ^json
  %-  pairs
  :~  ['info' (en-info info.a)]
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
++  en-records
  |=  a=(map ship record-1)
  ^-  ^json
  :-  %o
  %-  malt
  ^-  (list [cord ^json])
  %+  turn  ~(tap by a)
  |=  [s=ship r=record-1]
  :-  (scot %p s)
  (frond:enjs:format ['record' (en-record r)])
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
  :-  (id-to-cord id)
  (en-records (~(got by a) id))
::
++  en-info
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
    |=  [t=term s=session]
    :-  (scot %tas t)
    (frond:enjs:format ['session' (en-session s)])
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
