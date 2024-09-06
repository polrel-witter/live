::  %live: event coordination
::
/-  *live, live-records, hark
/+  *sss, *mip, verb, dbug, default-agent
/+  server, schooner, live-view
::
|%
::
+$  versioned-state  $%(state-0 state-1)
::
+$  state-0
  $:  %0
      events=(map id event)                                 :: events we host
      records=(mip id ship record)                          :: guests & passes
      result=$@(@t (map id info))                           :: search result
      sub-records=_(mk-subs live-records ,[%record @ @ ~])  :: record subs
      pub-records=_(mk-pubs live-records ,[%record @ @ ~])  :: record pubs
  ==
+$  state-1
  $:  %1
      events=(map id event-1)                               :: events we host
      records=(mip id ship record-1)                        :: guests & passes
      result=$@(@t (map id info-1))                         :: search result
      sub-records=_(mk-subs live-records ,[%record @ @ ~])  :: record subs
      pub-records=_(mk-pubs live-records ,[%record @ @ ~])  :: record pubs
  ==
::
::
+$  card  card:agent:gall
::
--
::
%+  verb  |
%-  agent:dbug
=|  state-1
=*  state  -
::
^-  agent:gall
::
=<
  |_  =bowl:gall
  +*  this  .
      def  ~(. (default-agent this %|) bowl)
      cor  ~(. +> bowl)
  ::
  ++  on-init
    ^-  (quip card _this)
    =^  cards  state  abet:init:cor
    [cards this]
  ::
  ++  on-save  !>(state)
  ::
  ++  on-load
    |=  old=vase
    ^-  (quip card _this)
    =^  cards  state  abet:(load:cor old)
    [cards this]
  ::
  ++  on-poke
    |=  [=mark =vase]
    ^-  (quip card _this)
    =^  cards  state  abet:(poke:cor mark vase)
    [cards this]
  ::
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    (peek:cor path)
  ::
  ++  on-agent
    |=  [=wire =sign:agent:gall]
    ^-  (quip card _this)
    =^  cards  state  abet:(agent:cor wire sign)
    [cards this]
  ::
  ++  on-arvo
    |=  [=wire =sign-arvo]
    ^-  (quip card _this)
    =^  cards  state  abet:(arvo:cor wire sign-arvo)
    [cards this]
  ::
  ++  on-watch
    |=  =path
    ^-  (quip card _this)
    =^  cards  state  abet:(watch:cor path)
    [cards this]
  ::
  ++  on-fail  on-fail:def
  ++  on-leave  on-leave:def
  --
=|  cards=(list card)
|_  =bowl:gall
+*  cor  .
    du-records    =/  du  (du live-records ,[%record @ @ ~])
                  (du pub-records bowl -:!>(*result:du))
    da-records    =/  da  (da live-records ,[%record @ @ ~])
                  (da sub-records bowl -:!>(*result:da) -:!>(*from:da) -:!>(*fail:da))
::
++  emit  |=(=card cor(cards [card cards]))
++  emil  |=(caz=(list card) cor(cards (weld (flop caz) cards)))
++  abet  ^-((quip card _state) [(flop cards) state])
::  +sss-pub-records: update +cor cards and pub-records state
::
::   sss library produces a (quip card _pubs) so we need to split it
::   to write to +cor state
::
++  sss-pub-records
  |=  [c=(list card) p=_pub-records]
  ^+  cor
  =.  pub-records  p
  (emil c)
::  +sss-sub-records: update +cor cards and sub-records state
::
++  sss-sub-records
  |=  [c=(list card) s=_sub-records]
  ^+  cor
  =.  sub-records  s
  (emil c)
::
++  init
  ^+  cor
  %-  emit
  [%pass /eyre/connect %arvo %e %connect [~ /apps/live] %live]
::
++  load
  |=  =vase
  ^+  cor
  =/  ole  !<(versioned-state vase)
  ?-    -.ole
      %0
    %=  cor
      state   :*  %1
                  (~(urn by events.ole) event-0-to-1)
                  ^-  (mip id ship record-1)
                  =/  ls  `(list (trel id ship record-1))`(turn ~(tap bi records.ole) record-0-to-1)
                    =|  ms=(mip id ship record-1)
                    |-
                    ?~  ls  ms
                    $(ls t.ls, ms (~(put bi ms) p.i.ls q.i.ls r.i.ls))
                  ^-  $@(@t (map id info-1))
                  ?@  result.ole
                    result.ole
                  ^-  (map id info-1)
                  %-  malt
                  =/  ls=(list [id info])  ~(tap by ;;((map id info) result.ole))
                  %+  turn  ls  result-0-to-1
                  ::  TODO
                  :: (~(urn by result.ole) result-0-to-1)
                  sub-records.ole
                  pub-records.ole
    ==        ==
      %1
    cor(state ole)
  ==
::
++  watch
  |=  pol=(pole knot)
  ^+  cor
  ?+  pol  ~|(bad-watch-path+pol !!)
    [%http-response *]  cor
  ==
::
++  agent
  |=  [=wire =sign:agent:gall]
  ^+  cor
  ?+    wire  cor
      [%case %request @ @ ~]
    =/  =ship  (slav %p i.t.t.wire)
    =/  name=@t  i.t.t.t.wire
    ?>  ?=(%poke-ack -.sign)
    ?~  p.sign  cor
    =;  msg=tape
      cor(result (crip msg))
    ?:  =('all' name)
      ~['No events found under' ' ' (scot %p ship)]
    ~[(crip "'{<name>}'") ' not found under ' (scot %p ship)]
  ::
      [~ %sss %on-rock @ @ @ %record @ @ ~]
    =.  sub-records
      (chit:da-records |3:wire sign)
    cor
  ::
      [~ %sss %scry-request @ @ @ %record @ @ ~]
    (sss-sub-records (tell:da-records |3:wire sign))
  ::
      [~ %sss %scry-response @ @ @ %record @ @ ~]
    (sss-pub-records (tell:du-records |3:wire sign))
  ==
::
++  arvo
  |=  [=wire =sign-arvo]
  ^+  cor
  ?+    wire  ~|(bad-arvo-wire+wire !!)  :: TODO handle this the standard way
      [%eyre %connect ~]
    ?.  ?=([%eyre %bound *] sign-arvo)
      ~|(unexpected-system-response+sign-arvo !!)
    ~?  !accepted.sign-arvo
      [dap.bowl 'eyre bind rejected!' binding.sign-arvo]
    cor
  ::
      [%case %response @ ~]
    =/  =ship  (slav %p i.t.t.wire)
    ~|(failed-to-send-case+ship !!)
  ::
      [%case %request @ *]
    =/  =ship  (slav %p i.t.t.wire)
    ~|(failed-to-request-case+ship !!)
  ::
      [%remote %scry *]
    ?+    t.t.wire    ~|(bad-arvo-wire+wire !!)
        ?([%all ~] [%event @ ~])
      ?.  ?=([%ames %tune *] sign-arvo)
        ~|(unexpected-system-response+sign-arvo !!)
      =/  msg  'No events found'
      =;  update=_result
        =?  update  ?~(update & |)  msg
        cor(result update)
      ?~  roar.sign-arvo  msg
      =/  =roar:ames      u.roar.sign-arvo
      ?~  q.dat.roar      msg
      ;;((map id info) +.u.q.dat.roar)
    ::
        [%timer @ @ *]
      =/  end=path
        ?+  t.t.t.t.t.wire  ~|(bad-wire+wire !!)
          [%all ~]      //all
          [%event @ ~]  //event/(scot %tas `term`i.t.t.t.t.t.wire)
        ==
      =/  =ship     (slav %p i.t.t.t.wire)
      =/  case=@ud  (slav %ud i.t.t.t.t.wire)
      =/  =spur     (weld /g/x/(scot %ud case)/live end)
      (emit [%pass /remote/scry/cancel %arvo %a %yawn ship spur])
    ==
  ==
::
++  peek
  |=  pol=(pole knot)
  ^-  (unit (unit cage))
  =;  =demand
    ``[%live-demand !>(demand)]
  ?+    pol  ~|(invalid-scry-path+pol !!)
      [%x %events %all ~]   [%all-events events]
      [%x %records %all ~]  [%all-records records]
  ::
      [%u %event %exists host=@ name=@ ~]
    :-  %event-exists
    (~(has by events) (slav %p host:pol) (slav %tas name:pol))
  ::
      [%u %record %exists host=@ name=@ ship=@ ~]
    :-  %record-exists
    %+  ~(has bi records)
      [(slav %p host:pol) (slav %tas name:pol)]
    (slav %p ship:pol)
  ::
      [%x %records host=@ name=@ ~]
    :-  %event-records
    ?~  r=(~(get by records) (slav %p host:pol) (slav %tas name:pol))  ~
    u.r
  ::
      [%x %event host=@ name=@ ~]
    :-  %event
    (~(get by events) (slav %p host:pol) (slav %tas name:pol))
  ::
      [%x %record host=@ name=@ ship=@ ~]
    :-  %record
    %+  ~(get bi records)
      [(slav %p host:pol) (slav %tas name:pol)]
    (slav %p ship:pol)
  ::
      [%x %counts host=@ name=@ ~]
    ?~  rec=(~(get by records) (slav %p host:pol) (slav %tas name:pol))
      [%counts ~]
    =/  cnt=(map _-.status @ud)
      %-  malt
      %-  limo
      :~  invited+0
          requested+0
          registered+0
          unregistered+0
          attended+0
      ==
    =/  r=(list [ship record=record-1])
      ~(tap by u.rec)
    |-  ?~  r  [%counts cnt]
    $(cnt (~(jab by cnt) p.status.record.i.r |=(a=@ud +(a))), r t.r)
  ==
::
++  poke
  |=  [=mark =vase]
  ^+  cor
  ?+    mark  ~|(bad-poke+mark !!)
      %live-operation
    =+  !<(op=operation vase)
    (~(route ev id.op) action.op)
  ::
      %live-dial
    =+  !<(=dial vase)
    ?-  -.dial
      %find           (search +.dial)
      %case-request   (case-request +.dial)
      %case-response  (case-response +.dial)
    ==
  ::
      %sss-to-pub
    =/  msg  !<(into:du-records (fled vase))
    (sss-pub-records (apply:du-records msg))
  ::
      %sss-live-records
    =/  msg  !<(into:da-records (fled vase))
    (sss-sub-records (apply:da-records msg))
  ::
      %sss-fake-on-rock
    =/  msg  !<(from:da-records (fled vase))
    ?>  ?=([[%record @ @ ~] *] msg)
    (emil (handle-fake-on-rock:da-records msg))
  ::
      %handle-http-request
    ?>  =(src.bowl our.bowl)
    =+  !<(req=[eyre-id=@ta =inbound-request:eyre] vase)
    =/  throw=(list card)
      (response:schooner eyre-id.req 404 ~ [%none ~])
    ?.  authenticated.inbound-request.req
      (emil throw)
    ?+  method.request.inbound-request.req  (emil throw)
      %'GET'     ~(get handle-http req)
      %'POST'    ~(post handle-http req)
    ==
  ::
      %sss-on-rock
    |^
    =/  msg  !<(from:da-records (fled vase))
    ?>  ?=([[%record @ @ ~] *] msg)
    ?>  =(our.bowl `ship`+>-:path.msg)
    =/  name=term  +<:path.msg
    =/  update=record-1
      ?~(wave.msg rock.msg u.wave.msg)
    :: clear secret if we're not %registered or %attended since it
    :: might diverge otherwise
    ::
    =?  secret.update  ?=  ?(%invited %requested %unregistered)
                       p.status.update
      ~
    =/  current=(unit record-1)
      (~(get bi records) [src.msg name] our.bowl)
    =?  cor  (notify current update)
      (emit (make-hark src.msg title.info.update status.update))
    cor(records (~(put bi records) [src.msg name] our.bowl update))
    ::  +notify: push notification to Landscape, if we've been %invited or our
    ::  status goes from %requested to %registered
    ::
    ++  notify
      |=  [current=(unit record-1) update=record-1]
      ^-  ?
      ?|  ?~  current
            ?=(%invited p.status.update)
              :: if our current status is %invited, don't notify
              ::
          ?|  ?&  ?=(%invited p.status.update)
                  ?!(?=(%invited p.status.u.current))
              ==
              ?&  ?=(%requested p.status.u.current)
                  ?=(%registered p.status.update)
              ==
          ==
      ==
    ::  +make-hark: build hark notification card
    ::
    ++  make-hark
      |=  [host=ship title=cord =status]
      ^-  card
      =;  act=action:hark
        %:  make-act
          /hark/invited
          our.bowl
          %hark
          hark-action+!>(act)
        ==
      =;  =yarn:hark  [%add-yarn & & yarn]
      :*  `@uvH`eny.bowl
          [~ ~ %live /invites]
          now.bowl
          %+  welp
            ^-  (list content:hark)
            [%ship host]~
          :~  %-  crip
              %+  weld
                ?:  ?=(%invited p.status)
                  " invited you to "
                " accepted your entry request to "
              (trip title)
          ==
          /
          ~
      ==
    --
  ==
::  +act: build poke card
::
++  make-act
  |=  [=wire who=ship app=term =cage]
  ^-  card
  [%pass wire %agent [who app] %poke cage]
::  +make-operation: produce an $operation cage
::
++  make-operation
  |=  [=id =action]
  ^-  cage
  live-operation+!>(`operation`[id action])
::  +append-entropy: add random characters to event name for uniqueness
::
++  append-entropy
  |=  name=term
  ^-  term
  %+  slav  %tas
  %-  crip
  :(weld (scow %tas name) "-" (swag [6 5] (scow %uv eny.bowl)))
::  +get-our-case: get a remote scry revision number for one of our
::  published paths
::
++  get-our-case
  |=  name=(unit term)
  ^-  (unit @ud)
  =/  exe=?
    :: check if a published path exists to avoid crashing
    ::
    ?~  name
      ?~(`(map id info)`get-remote-events %| %&)
    ?~((~(get by get-remote-events) [our.bowl u.name]) %| %&)
  ?.  exe  ~
  %-  some
  =-  +.-
  .^  [%ud @ud]
    %gw
    %+  weld  /(scot %p our.bowl)/live/(scot %da now.bowl)
    ?~  name  //1/all
    //1/event/(scot %tas u.name)
  ==
::  +get-remote-events: produce a map of id and event info of all discoverable
::  events; i.e. %public and %private that are not %over
::
++  get-remote-events
  ^-  (map id info)
  %-  malt
  %+  murn  ~(tap by events)
  |=  [=id event=event-1]
  =,  event
  ?:  |(?=(%secret kind.info) ?=(%over latch.info))
    ~
  `[id info]
::  +search: search for a ship's discoverable events (i.e. %public and %private)
::
::    this just sends a %case-request poke, requesting a ship's latest revision
::    number for a remote scry path; +case-response performs the scry as
::    long as a case is provided
::
++  search
  |=  [=ship name=(unit term)]
  ^+  cor
  :: reset result state before sending the poke
  ::
  =.  result  *@t
  ?:  =(our.bowl ship)
    cor(result 'See home page for our events')
  =/  =wire
    %+  weld  /case/request/(scot %p ship)
    ?~  name  /all
    /(scot %tas u.name)
  %-  emit
  (make-act wire ship dap.bowl live-dial+!>(`dial`[%case-request name]))
::  +case-request: someone is requesting a remote scry revision number
::  for one of our published paths
::
++  case-request
  |=  name=(unit term)
  ^+  cor
  ?<  =(our src):bowl
  %-  emit
  %:  make-act
    /case/response/(scot %p src.bowl)
    src.bowl
    dap.bowl
    live-dial+!>(`dial`[%case-response (get-our-case name) name])
  ==
::  +case-response: someone is responding to our +case-request
::
++  case-response
  |=  [case=(unit @ud) name=(unit term)]
  ^+  cor
  ?<  =(our src):bowl
  ?~  case
    :: no case provided which means there are no discoverable events at
    :: the path in question
    ::
    =;  msg=tape
      cor(result (crip msg))
    ?~  name
      ~['No events found under' ' ' (scot %p src.bowl)]
    ~[(crip "{<(scow %tas u.name)>}") ' not found under ' (scot %p src.bowl)]
  :: perform the scry
  ::
  %-  emil
  :~  :*  %pass
          %+  weld  /remote/scry/timer/(scot %p src.bowl)/(scot %ud u.case)
          ?~  name  /all
          /event/(scot %tas u.name)
          %arvo  %b
          %wait  (add ~m1 now.bowl)
      ==
      :*  %pass
          %+  weld  /remote/scry/event
          ?~  name  /all
          /(scot %tas u.name)
          %keen  %|  src.bowl
          %+  weld   /g/x/(scot %ud u.case)/live
          ?~  name  //1/all
          //1/event/(scot %tas u.name)
      ==
  ==
::  +ev: event handling
::
++  ev
  |_  =id
  ::  +get-event: retreive an event
  ::
  ++  get-event
    ^-  event-1
    ~|(no-event-found+id (~(got by events) id))
  ::  +get-all-guests: retreive guest ships for an event
  ::
  ++  get-all-guests
    ^-  (list ship)
    ~(tap in (~(key bi records) id))
  ::  +id-to-path: transform id into a path
  ::
  ++  id-to-path
    ^-  path
    /(scot %p ship.id)/(scot %tas name.id)
  ::  +over: is an event %over?
  ::
  ++  over
    ^-  ?
    =/  event=event-1  get-event
    ?=(%over latch.info.event)
  ::  +host-call: verify that a host is performing the action
  ::
  ++  host-call
    ^-  ?
    ?&  =(src our):bowl
        =(our.bowl ship.id)
    ==
  ::  +guest-call: verify that some other ship is performing the action
  ::  and that we are the host
  ::
  ++  guest-call
    ^-  ?
    ?&  ?!(=(src our):bowl)
        =(our.bowl ship.id)
    ==
  ::  +delete-remote-path: delete all instances of an event's remote scry
  ::  path
  ::
  ++  delete-remote-path
    |=  [case=@ud =path]
    ^+  cor
    =/  name=(unit term)
      ?+  path  ~|(invalid-remote-path+path !!)
        [%all ~]  ~
        [%event @ ~]  `(slav %tas i.t.path)
      ==
    %-  emit
    [%pass /remote/scry/delete %cull [%ud case] path]
  ::  +permitted-count: total number of guests with status of
  ::  %registered or %attended
  ::
  ++  permitted-count
    ^-  @ud
    =|  count=@ud
    =+  guests=get-all-guests
    |-
    ?~  guests  count
    =+  status=(need ~(current-status re i.guests))
    ?.  ?|  ?=(%registered p.status)
            ?=(%attended p.status)
        ==
      $(guests t.guests)
    $(count +(count), guests t.guests)
  ::  +update-guests: update a subset of ships with records
  ::
  ++  update-guests
    |=  guests=(list ship)
    ^+  cor
    =/  event=event-1  get-event
    |-
    ?~  guests  cor
    =/  record=record-1
      (~(got bi records) id i.guests)
    =:  info.record  info.event
        secret.record  secret.event
      ==
    =.  cor
      (~(publish re i.guests) record)
    $(guests t.guests)
  ::  +update-event: write an event update to state
  ::
  ++  update-event
    |=  update=event-1
    ^+  cor
    =.  events  (~(put by events) id update)
    =.  cor  (update-remote-event update)
    update-all-remote-events
  ::  +update-remote-event: update an event discoverable over remote scry
  ::
  ++  update-remote-event
    |=  event=event-1
    ^+  cor
    =,  event
    ?:  |(?=(%secret kind.info) ?=(%over latch.info))
      cor
    %-  emit
    :*  %pass  /remote/scry/publish
        %grow  /event/(scot %tas name.id)
        [%remote-events (malt [id info]~)]
    ==
  ::  +update-all-remote-events: update all events discoverable over remote scry
  ::  (i.e. all %public and %private ones that are not %over)
  ::
  ++  update-all-remote-events
    ^+  cor
    %-  emit
    :-  %pass
    [/remote/scry/publish %grow /all [%remote-events get-remote-events]]
  ::  +route: send an action to the appropriate arm
  ::
  ++  route
    |=  act=action
    |^  ^+  cor
    ?-  -.act
      %create      (create +.act)
      %delete      delete
      %info        (change-info +.act)
      %secret      (change-secret +.act)
      %limit       (change-limit +.act)
    ::
      %subscribe   subscribe
      %invite      (invite +.act)
      %register    (register +.act)
      %unregister  (unregister +.act)
      %punch       (punch +.act)
    ==
    ::  +create: write a new event to state
    ::
    ++  create
      |=  event=event-1
      ^+  cor
      ?>  host-call
      =?  id  (~(has by events) id)
        [ship.id (append-entropy name.id)]
      =.  events  (~(put by events) id event)
      =.  cor  (update-remote-event event)
      update-all-remote-events
    ::  +delete: as host, permanently delete an event; as a guest,
    ::  delete a record and unsubscribe from its updates
    ::
    ++  delete
      |^  ^+  cor
      ?.  host-call
        :: as a guest, delete our local record and unsubscribe
        ?>  &(=(our src):bowl ?!(=(our.bowl ship.id)))
        =.  sub-records
          (quit:da-records ship.id dap.bowl [%record name.id our.bowl ~])
        cor(records (~(del bi records) id our.bowl))
      =/  event=event-1  get-event
      =?  cor  ?~((get-our-case `name.id) %| %&)
        %+  delete-remote-path
          (need (get-our-case `name.id))
        /event/(scot %tas name.id)
      :: delete an event and notify all guests that it's so %over
      ::
      =.  cor  (update-event event(latch.info %over))
      =.  cor  (update-guests get-all-guests)
      =.  cor  update-all-remote-events
      =.  events  (~(del by events) id)
      :: if no discoverable events, also cull the /all path so others get a nack
      :: when they search for them
      ::
      =?  cor  ?~((get-our-case ~) %| %&)
        (delete-remote-path (need (get-our-case ~)) /all)
      =.  cor  delete-records
      cor
      ::  +delete-records: deletes all records associated with an event
      ::  and kills their associated pub paths
      ::
      ++  delete-records
        ^+  cor
        =/  guests=(list ship)
          ~(tap in (~(key bi records) id))
        |-
        ?~  guests  cor
        =.  cor
          %-  sss-pub-records
          (kill:du-records [%record name.id i.guests ~]~)
        =.  records  (~(del bi records) id i.guests)
        $(guests t.guests)
      --
    ::  +change-info: update an event's metadata and publish to guests
    ::
    ++  change-info
      |=  =sub-info
      ^+  cor
      ?>  host-call
      :: if event is %over, only allow a %latch modification
      ?:  &(?!(?=(%latch -.sub-info)) over)
        cor
      =/  event=event-1  get-event
      =;  =_event
        =.  cor  (update-event event)
        =?  cor  ?~((get-our-case `name.id) %| %&)
          %+  delete-remote-path  (need (get-our-case `name.id))
          /event/(scot %tas name.id)
        (update-guests get-all-guests)
      ?-    -.sub-info
          %title   event(title.info +.sub-info)
          %about   event(about.info +.sub-info)
          %kind    event(kind.info +.sub-info)
          %moment  event(moment.info +.sub-info)
          %latch
        :: if limit is reached, prevent host from opening
        ?:  ?&  ?=(%open +.sub-info)
                ?~(limit.event | =(u.limit.event permitted-count))
            ==
          ~|(event-limit-is-reached+id !!)
        event(latch.info +.sub-info)
      ==
    ::  +change-limit: update register limit
    ::
    ++  change-limit
      |=  new-limit=limit
      ^+  cor
      ?>  host-call
      ?:  over  cor
      =;  write=?
        ?.  write  ~|(limit-lower-than-registered-count+id !!)
        =/  event=event-1  get-event
        =.  limit.event
          new-limit
        (update-event event)
      ?~  new-limit  &
      (gte u.new-limit permitted-count)
    ::  +change-secret: update the event secret and publish to
    ::  %registered and %attended guests
    ::
    ++  change-secret
      |=  new-secret=secret
      ^+  cor
      ?>  host-call
      ?:  over  cor
      =/  event=event-1  get-event
      =.  secret.event  new-secret
      =.  cor  (update-event event)
      =+  guests=get-all-guests
      =|  permitted=(list ship)
      |-
      ?~  guests
        (update-guests permitted)
      =+  status=(need ~(current-status re i.guests))
      ?.  ?|  ?=(%registered p.status)
              ?=(%attended p.status)
          ==
        $(guests t.guests)
      $(permitted [i.guests permitted], guests t.guests)
    ::  +subscribe: this is either a request from a host or an action we send as
    ::  a guest to subscribe to record updates
    ::
    ++  subscribe
      ^+  cor
      =;  =ship
        %-  sss-sub-records
        (surf:da-records ship dap.bowl [%record name.id our.bowl ~])
      :: if we're are the source and not the host, sub to the host
      ?:  &(=(our src):bowl ?!(=(our.bowl ship.id)))
        ship.id
      :: if the source is the host and we are not the host, sub to the source
      ?>  &(=(src.bowl ship.id) ?!(=(our.bowl ship.id)))
      src.bowl
    ::  +invite: send an event invite to a list of ships
    ::
    ++  invite
      |=  ships=(list ship)
      ^+  cor
      ?>  host-call
      ?:  over  cor
      |-
      ?~  ships  cor
      =.  cor
        =/  =wire
          (weld /subscribe id-to-path)
        =/  =cage
          (make-operation id [%subscribe ~])
        (emit (make-act wire i.ships dap.bowl cage))
      =.  cor
        ?.  (~(has bi records) id i.ships)
          :: if we don't have a record for them, add it
          (~(new-record re i.ships) [%invited now.bowl])
        =+  status=(need ~(current-status re i.ships))
        ?:  ?=(?(%registered %attended) p.status)
          :: if they're already %registered or %attended, don't invite
          cor
        ?:  ?=(%requested p.status)
          :: if they're %requested, %register them
          %-  emit
          %:  make-act
            (weld /register id-to-path)
            our.bowl
            dap.bowl
            live-operation+!>(`operation`[id [%register `i.ships]])
          ==
        (~(update-status re i.ships) [%invited now.bowl])
      $(ships t.ships)
    ::  +register: request/permit event access
    ::
    ++  register
      |=  who=(unit ship)
      |^  ^+  cor
      ?:  &(=(src our):bowl ?!(=(our.bowl ship.id)))
        :: send a register poke to a host
        =/  =wire  (weld /register id-to-path)
        =/  =cage  (make-operation id [%register ~])
        (emit (make-act wire ship.id dap.bowl cage))
      :: poke from host or some foreign ship
      ?:  over  cor
      =/  event=event-1  get-event
      =/  =ship  ?~(who src.bowl u.who)
      :: ask the ship to subscribe to their record
      ::
      =.  cor
        =/  =wire  (weld /subscribe id-to-path)
        =/  =cage  (make-operation id [%subscribe ~])
        (emit (make-act wire ship dap.bowl cage))
      :: possibly process status change
      ::
      =/  process=(unit status)
        =;  already-registered=?
          ?:  already-registered  ~
          ?~  who
            (guest-request src.bowl)
          (host-request u.who)
        ?~  status=~(current-status re ship)  %|
        ?:(?=(%registered p.u.status) %& %|)
      ?~  process  cor
      =/  =status  u.process
      :: if a ship is being %registered and the limit is reached,
      :: close the latch
      ::
      =/  capped=?
        ?~  limit.event  |
        ?.  ?=(%registered p.status)  |
        ?|  =(0 u.limit.event)
            =(u.limit.event +(permitted-count))
        ==
      =?  cor  capped
        =.  cor
          (update-event event(latch.info %closed))
        (update-guests get-all-guests)
      :: add or update record
      ::
      ?.  (~(has bi records) id ship)
        (~(new-record re ship) status)
      (~(update-status re ship) status)
      ::  +host-request: host is registering someone
      ::
      ++  host-request
        |=  =ship
        ^-  (unit status)
        ?>  host-call
        =+  status=~(current-status re ship)
        ?~  status  ~
        :: a ship must have requested access before the host
        :: can register them; obviously the guest should just register
        :: themselves for public events
        ::
        ?.  ?=(%requested p.u.status)  ~
        `[%registered now.bowl]
      ::  +guest-request: someone is requesting access; change their
      ::  status according to the event $kind and $latch
      ::
      ++  guest-request
        |=  =ship
        ^-  (unit status)
        ?>  guest-call
        =/  event=event-1  get-event
        :: if event is closed, or has a limit of 0, make the guest
        :: status %requested
        ?:  ?|  ?=(%closed latch.info.event)
                ?~(limit.event | =(0 u.limit.event))
            ==
          `[%requested now.bowl]
        =+  status=~(current-status re ship)
        ?-    kind.info.event
            %public  `[%registered now.bowl]
        ::
            %secret
          ?~  status  ~
          ?.  ?=(%invited p.u.status)  ~
          `[%registered now.bowl]
        ::
            %private
          ?:  ?|  =(~ status)
                  ?=([%unregistered *] (need status))
                  ?!(?=([%invited *] (need status)))
              ==
            `[%requested now.bowl]
          `[%registered now.bowl]
        ==
      --
    ::  +unregister: revoke event access
    ::
    ++  unregister
      |=  who=(unit ship)
      |^  ^+  cor
      ?:  &(=(src our):bowl ?!(=(our.bowl ship.id)))
        :: send unregister poke to host
        =/  =wire  (weld /unregister id-to-path)
        =/  =cage
          (make-operation id [%unregister ~])
        (emit (make-act wire ship.id %live cage))
      :: unregister poke from some guest or us as the host
      ?:  over  cor
      =?  who  ?~(who & ?>(host-call |))
        ?>(guest-call `src.bowl)
      ?.  (is-registered (need who))  cor
      (~(update-status re (need who)) [%unregistered now.bowl])
      ::  +is-registered: check if registered
      ::
      ++  is-registered
        |=  =ship
        ^-  ?
        =+  status=~(current-status re ship)
        ?~  status  |
        ?:(?=(%registered p.u.status) & |)
      --
    ::  +punch: verify or revoke a guest's attendance status
    ::
    ++  punch
      |=  [job=?(%verify %revoke) =ship]
      ^+  cor
      ?>  host-call
      ?:  over  cor
      ?~  sts=~(current-status re ship)  cor
      =;  upd=(unit status)
        ?~  upd  cor
        (~(update-status re ship) u.upd)
      ?-  job
        %revoke  ?:(?=(%attended p.u.sts) `[%registered now.bowl] ~)
        %verify  ?:(?=(%registered p.u.sts) `[%attended now.bowl] ~)
      ==
    --
  ::  +re: record handling
  ::
  ++  re
    |_  =ship
    :: +current-status: get a guest's current record status
    ::
    ++  current-status
      ^-  (unit status)
      =+  (~(get bi records) id ship)
      ?~(- ~ `status.u.-)
    ::  +update-status: write a new status to state
    ::
    ++  update-status
      |=  new-status=status
      ^+  cor
      =;  record=record-1
        (~(publish re ship) record)
      =/  record=record-1
        ~|  no-record+[id ship]
        (~(got bi records) id ship)
      :: if %registered or %attended, also publish secret
      ?.  ?|  ?=(%registered p.new-status)
              ?=(%attended p.new-status)
          ==
        record(status new-status)
      =+  event=get-event
      record(secret secret.event, status new-status)
    ::  $publish: update local records mip and publish the record to guest
    ::
    ++  publish
      |=  record=record-1
      ^+  cor
      =.  records
        (~(put bi records) id ship record)
      =+  path=[%record name.id ship ~]
      %-  sss-pub-records
      (give:du-records path record)
    ::  +new-record: create a new record, set sss path permissions, and publish
    ::  to guest
    ::
    ++  new-record
      |=  =status
      ^+  cor
      =+  path=[%record name.id ship ~]
      =/  record=record-1
        =+  event=get-event
        ?.  ?=(%registered p.status)
          [info.event ~ status]
        [info.event secret.event status]
      :: make path secret
      =.  cor
        (sss-pub-records (secret:du-records [path]~))
      :: permission the guest for access
      =.  cor
        (sss-pub-records (allow:du-records [ship]~ [path]~))
      :: give the guest the record
      (~(publish re ship) record)
    --
  --
::  +handle-http: incoming from eyre
::
++  handle-http
  |_  [eyre-id=@ta =inbound-request:eyre]
  +*  req    (parse-request-line:server url.request.inbound-request)
      send   (cury response:schooner eyre-id)
      throw  (emil (send 404 ~ [%none ~]))
      stan   (emil (send 500 ~ [%stock ~]))
      view   ~(. live-view [bowl events records result])
  ::  +pull-id: extract id from site:req
  ::
  ++  pull-id
    ^-  id
    =+  site=site.req
    ?.  ?=([@ @ @ @ @ *] site)  !!
    :-  (slav %p i.t.t.t.site)
    ?~  i.t.t.t.t.site  %$
    (slav %tas i.t.t.t.t.site)
  ::  +handle-error: build page with error code
  ::
  ++  handle-error
    |=  [act=_-.action msg=@t]
    =;  =manx
      (emil (send 200 ~ [%manx manx]))
    ?:  ?=(%find act)    (search:view `msg)
    ?>  ?=(%invite act)  (manage:view pull-id `msg)
  ::  +get: http get method handling
  ::
  ++  get
    ^+  cor
    ?>  =(src our):bowl
    =+  site=site.req
    =;  page=(unit manx)
      ?~  page  throw
      (emil (send 200 ~ [%manx u.page]))
    ?.  ?=([@ %live *] site)  ~
    ?+    t.t.site  ~
        ~                    `active:view
        [%archive ~]         `archive:view
        [%help ~]            `help:view
        [%find ~]            `(search:view ~)
        [%create ~]          `create:view
        [%results ~]         `results:view
        [%event @ @ ~]       `(details:view pull-id)
        [%manage @ @ ~]      `(manage:view pull-id ~)
        [%event-link @ @ ~]  `(link:view pull-id)
        [%contact @ @ *]
      ?+  t.t.t.t.t.site  ~
        [%register ~]    `~(reg contact:view pull-id)
        [%unregister ~]  `~(unreg contact:view pull-id)
      ==
        [%delete @ @ ~]      `~(delete edit:view pull-id)
        [%title @ @ ~]       `~(title edit:view pull-id)
        [%about @ @ ~]       `~(about edit:view pull-id)
        [%moment @ @ ~]      `~(moment edit:view pull-id)
        [%kind @ @ ~]        `~(kind edit:view pull-id)
        [%latch @ @ ~]       `~(latch edit:view pull-id)
        [%secret @ @ ~]      `~(secret edit:view pull-id)
        [%limit @ @ ~]       `~(limit edit:view pull-id)
        :: TODO better way to handle this; essentially user should not
        :: call this site, but it may happen with the way errors are
        :: passed to the frontend. only happens on manage page atm
        [%operation @ @ ~]   `(manage:view pull-id ~)
    ==
  ::  +redirect: redirect to url
  ::
  ++  redirect
    |=  [=mark =vase]
    ^+  cor
    =;  url=path
      (emil (send [303 ~ [%redirect (spat url)]]))
    ?+    mark  ~|(bad-mark+mark !!)
        %live-dial
      =+  !<(=dial vase)
      ?-  -.dial
        %find  /apps/live/results
        %case-request   !!
        %case-response  !!
      ==
    ::
        %live-operation
      =+  !<(op=operation vase)
      =/  id=path
        ~(id-to-path ev pull-id)
      =/  we-host=?
        =(our.bowl ship:pull-id)
      =/  site=path
        :(weld /apps/live ?:(we-host /manage /contact) id)
      ?-  -.action.op
        %subscribe   !!
        %create      /apps/live
        %delete      /apps/live
        %info        (weld /apps/live/event id)
        %secret      (weld /apps/live/event id)
        %limit       (weld /apps/live/event id)
        %invite      (weld /apps/live/manage id)
        %register    ?:(we-host site (weld site /register))
        %unregister  ?:(we-host site (weld site /unregister))
        %punch       (weld /apps/live/manage id)
      ==
    ==
  ::  +post: http post method handling
  ::
  ++  post
    |^  ^+  cor
    ?>  =(src our):bowl
    =/  args=(map @t @t)
      ?~  body=body.request.inbound-request  ~
      %-  ~(gas by *(map @t @t))
      (fall (rush q.u.body yquy:de-purl:html) ~)
    ?~  args  throw
    =/  op=(each =cage error=[_-.action @t])
      (compose args)
    ?-    -.op
        %|  (handle-error error.p.op)
        %&
      =/  update=(unit _cor)
        %-  mole
        |.  (poke cage.p.op)
      ?~  update  throw
      =.  cor  u.update
      (redirect cage.p.op)
    ==
    ::  +compose: build $operation or $dial cage
    ::
    ++  compose
      |=  args=(map @t @t)
      |^  ^-  (each cage [_-.action @t])
      =;  out=(each * error=[_-.action @t])
        ?-  -.out
            %|  [%| error.p.out]
            %&
          :-  %&
          ?:  ?=(%find -.p.out)
            live-dial+!>(;;(dial p.out))
          live-operation+!>(;;(operation p.out))
        ==
      ?~  head=(~(get by args) 'head')  !!
      ?+    u.head  !!
          %delete  [%& [pull-id %delete ~]]
          %limit
        ?>  as-host
        ?~  num=(~(get by args) 'num')  !!
        [%& [pull-id %limit (rush u.num dem)]]
      ::
          %punch
        ?>  as-host
        ?~  who=(~(get by args) 'ship')  !!
        =/  job=?(%verify %revoke)
          ?~  j=(~(get by args) 'job')  !!
          ;;(?(%verify %revoke) (slav %tas u.j))
        [%& [pull-id %punch job (slav %p u.who)]]
      ::
          %secret
        ?>  as-host
        ?~  txt=(~(get by args) 'txt')  !!
        [%& [pull-id %secret ?~(u.txt ~ `u.txt)]]
      ::
          %find
        ?~  qur=(~(get by args) 'ship-name')  !!
        =;  (unit [=ship name=(unit term)])
          ?~  -  [%| [%find 'invalid ship name']]
          [%& [%find ship.u.- name.u.-]]
        %+  rust  (cass (trip u.qur))
        ;~  plug
          ;~(pose ;~(pfix sig fed:ag) fed:ag)
          (punt ;~(pfix fas urs:ab))
        ==
      ::
          ?(%register %unregister)
        ?~  them=(~(get by args) 'ship')  !!
        =/  who=(unit ship)
          ?.  as-host  ?~(u.them ~ !!)
          ?~  u.them  !!
          `(slav %p u.them)
         [%& pull-id ;;(action [(slav %tas u.head) who])]
      ::
          %invite
        ?>  as-host
        ?~  who=(~(get by args) 'ship')  !!
        =/  hit=(unit ship)
          %+  rust  (cass (trip u.who))
          ;~(pose ;~(pfix sig fed:ag) fed:ag)
        ?~  hit
          [%| [%invite 'invalid ship name']]
        =/  status=(unit status)
          ~(current-status re:~(. ev pull-id) u.hit)
        =/  hold=(unit @t)
          ?~  status  ~
          ?+  p.u.status  ~
            %invited     `'invited'
            %registered  `'registered'
            %attended    `'attended'
          ==
        ?~  hold
          [%& [pull-id %invite [u.hit]~]]
        [%| [%invite (crip ~['already' ' ' u.hold])]]
      ::
          %info
        ?>  as-host
        =;  =sub-info
          [%& [pull-id %info sub-info]]
        ?~  sub=(~(get by args) 'sub')  !!
        ?+    u.sub  ~|(bad-input-argument+sub !!)
            %title   [%title (~(got by args) 'title')]
            %about   [%about ?~(a=(~(got by args) 'about') ~ `a)]
            %kind    [%kind ;;(kind (slav %tas (~(got by args) 'kind')))]
            %latch   [%latch ;;(latch (slav %tas (~(got by args) 'latch')))]
            %moment
          :*  %moment
              ?~(val=(~(got by args) 'start') ~ `~(date co val))
              ?~(val=(~(got by args) 'end') ~ `~(date co val))
              ~(timezone co (~(got by args) 'timezone'))
          ==
        ==
      ::
          %create
        ?>  as-host
        =;  event=event-1
          =,  pull-id
          ?>  ?=(%$ name)
          :-  %&
          :_  [%create event]
          [ship ~(name co title.info.event)]
        ::
        =/  vals=(list [key=@t val=@t])
          ~(tap by (~(del by args) 'head'))
        =|  event=event-1
        |-
        ?~  vals  event
        =;  update=_event
          $(event update, vals t.vals)
        =+  val=val.i.vals
        ?+  key.i.vals  ~|(bad-input-argument+i.vals !!)
          %title   event(title.info val)
          %about   event(about.info ?~(val ~ `val))
          %kind    event(kind.info ;;(kind (slav %tas val)))
          %latch   event(latch.info ;;(latch (slav %tas val)))
          %secret  event(secret ?~(val ~ `val))
          %limit   event(limit ?~(val ~ `(rash val dem)))
          %timezone  event(timezone.moment.info ~(timezone co val))
          %moment-start  event(start.moment.info ?~(val ~ `~(date co val)))
          %moment-end  event(end.moment.info ?~(val ~ `~(date co val)))
        ==
      ==
      ::  +as-host: confirm ship in the request url is us, the host
      ::
      ++  as-host
        ^-  ?
        =(our.bowl ship:pull-id)
      ::  +co: compose some cord to a structure
      ::
      ++  co
        |_  val=@t
        ::  +name: convert cord to $name:id
        ::
        ++  name
          ^-  @tas
          %+  slav  %tas
          %-  crip
          =;  =tape
            ?.  (~(has in (silt "0123456789")) (snag 0 tape))
              tape
            (weld "n" tape)
          %+  murn  (cass (trip val))
          |=  a=@t
          =/  special
            (silt " ~`!@#$%^&*()-=_+[]\{}'\\:;\",.<>?")
          ?:((~(has in special) a) ~ `a)
        ::  +timezone: parse timezone input to $timezone
        ::
        ++  timezone
          ^-  [? @ud]
          %+  scan  (trip val)
          ;~  plug
            ;~  pose
              (cold %| (just '-'))
              (cold %& (just '+'))
            ==
            dem:ag
          ==
        ::  +date: convert UTC date format to @da
        ::
        ++  date
          ^-  @da
          %-  year
          =;  [y=@ud mo=@ud d=@ud h=@ud min=@ud]
            =/  hx=@ux
              %+  slav  %ux
              (crip (swag [0 6] (scow %ux eny.bowl)))
            [[%& y] mo [d h min 0 ~[hx]]]
          %+  scan  (trip val)
          ;~  plug
            ;~(sfix dim:ag hep)
            ;~  pose
              ;~(pfix (just '0') ;~(sfix dem:ag hep))
              ;~(sfix dem:ag hep)
            ==
            ;~  pose
              ;~(pfix (just '0') ;~(sfix dem:ag (just 'T')))
              ;~(sfix dem:ag (just 'T'))
            ==
            ;~  pose
              ;~(pfix (just '0') ;~(sfix dem:ag col))
              ;~(sfix dem:ag col)
            ==
            ;~(pose ;~(pfix (just '0') dem:ag) dem:ag)
          ==
        --
      --
    --
  --
++  event-0-to-1
  |=  [k=id v=event]
  ^-  event-1
  [(info-0-to-1 info.v) secret.v limit.v]
++  result-0-to-1
  |=  [k=id v=info]
  ^-  info-1
  [(info-0-to-1 info.v)]
++  info-0-to-1
  |=  =info
  ^-  info-1
  [title.info about.info moment.info kind.info latch.info *(list talk)]
++  record-0-to-1
  |=  [k0=id k1=ship v=record]
  ^-  [id ship record-1]
  :+  k0
    k1
  [(info-0-to-1 info.v) secret.v status.v]
--
