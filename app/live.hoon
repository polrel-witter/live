::  %live: event coordination
::
/-  *live, live-records, groups, chat
/+  *sss, *mip, verb, dbug, default-agent
::
|%
::
+$  versioned-state  $%(state-0)
::
+$  state-0
  $:  %0
      timezone=(pair ? @ud)
      events=(map id event)
      records=(mip id ship record)
      flyers=(map path flyer)
      sub-records=_(mk-subs live-records ,[%records %guest @ ~])
      pub-records=_(mk-pubs live-records ,[%records %guest @ ~])
  ==
::
+$  card  card:agent:gall
--
::
%+  verb  &
%-  agent:dbug
=|  state-0
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
    =^  cards  state
      abet:init:cor
    [cards this]
  ::
  ++  on-save  !>(state)
  ::
  ++  on-load
    |=  old=vase
    ^-  (quip card _this)
    =^  cards  state
      abet:(load:cor old)
    [cards this]
  ::
  ++  on-poke
    |=  [=mark =vase]
    ^-  (quip card _this)
    =^  cards  state
      abet:(poke:cor mark vase)
    [cards this]
  ::
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    [~ ~]
  ::
  ++  on-agent
    |=  [=wire =sign:agent:gall]
    ^-  (quip card _this)
    =^  cards  state
      abet:(agent:cor wire sign)
    [cards this]

  ::
  ++  on-arvo
    |=  [=wire =sign-arvo]
    ^-  (quip card _this)
    `this
  ::
  ++  on-watch
    |=  =path
    ^-  (quip card _this)
    `this
  ::
  ++  on-fail  on-fail:def
  ++  on-leave  on-leave:def
  --
=|  cards=(list card)
|_  =bowl:gall
+*  cor  .
    du-records  =/  du  (du live-records ,[%records %guest @ ~])
                (du pub-records bowl -:!>(*result:du))
    da-records  =/  da  (da live-records ,[%records %guest @ ~])
                (da sub-records bowl -:!>(*result:da) -:!>(*from:da) -:!>(*fail:da))
::
++  emit  |=(=card cor(cards [card cards]))
++  emil  |=(caz=(list card) cor(cards (weld caz cards)))
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
++  init   :: TODO import flyer template
  ^+  cor
  cor
::
++  load
  |=  =vase
  ^+  cor
  ?>  ?=([%0 *] q.vase)
  cor(state !<(state-0 vase))
::
++  agent
  |=  [=wire =sign:agent:gall]
  ^+  cor
  ?+    wire  cor
      [~ %sss %on-rock @ @ @ %records %guest @ ~]
    =.  sub-records
      (chit:da-records |3:wire sign)
    cor
  ::
      [~ %sss %scry-request @ @ @ %records %guest @ ~]
    (sss-sub-records (tell:da-records |3:wire sign))
  ::
      [~ %sss %scry-response @ @ @ %records %guest @ ~]
    (sss-pub-records (tell:du-records |3:wire sign))
  ==
::
++  poke
  |=  [=mark =vase]
  |^  ^+  cor
  ?+    mark  ~|(bad-poke+mark !!)
      %live-event-operation
    =+  !<(op=event-operation vase)
    (~(route ev id.op) event-action.op)
  ::
      %live-settings-action
    ?>  =(our src):bowl
    =+  !<(act=settings-action vase)
    ?>  ?=(%timezone -.act)
    cor(timezone [p.act q.act])
  ::
      %live-flyer-action
    ?>  =(our src):bowl
    =+  !<(act=flyer-action vase)
    ?-   -.act
        %delete-flyer  cor(flyers (~(del by flyers) path.act))
        %save-flyer
      cor(flyers (~(put by flyers) [path flyer]:act))
    ==
  ::
      %sss-to-pub
    =/  msg  !<(into:du-records (fled vase))
    (sss-pub-records (apply:du-records msg))
  ::
      %sss-live-records
    =/  msg  !<(into:da-records (fled vase))
    (sss-sub-records (apply:da-records msg))
  ==
::  +ev: event operations
::
++  ev
  |_  =id
  ::  +update-event: write to event state
  ::
  ++  update-event
    |=  =event
    ^+  cor
    cor(events (~(put by events) id event))
  ::  +id-to-path: transform id into a path
  ::
  ++  id-to-path
    ^-  path
    /(scot %p ship.id)/(scot %tas name.id)
  ::  +host-call: verify that a host is performing the action
  ::
  ++  host-call
    ^-  ?
    ?&  =(src our):bowl
        =(our.bowl ship.id)
    ==
  ::  +guest-call: verify that a guest is performing the action
  ::
  ++  guest-call
    ^-  ?
    ?&  ?!(=(src our):bowl)
        =(our.bowl ship.id)
    ==
  ::  +route: send an event-action to the appropriate arm
  ::
  ++  route
    |=  act=event-action
    ^+  cor
    ?-  -.act
      %create-event      (create-event +.act)
      %delete-event      delete-event
      %require-app       (require-app +.act)
      %set-info          (set-info +.act)
      %set-secret        (set-secret +.act)
      %set-limit         (set-limit +.act)
      %add-chat          (add-chat +.act)
      %remove-chat       remove-chat
    ::
      %subscribe         subscribe
      %apply             (apply +.act)
      %register          (register +.act)
      %unregister        (unregister +.act)
      %punch             (punch +.act)
      %delete-record     (delete-record +.act)
    ==
  ::  +create-event: save a new event to state
  ::
  ++  create-event
    |=  =event
    ^+  cor
    ?>  host-call
    =?  id  (~(has by events) id)
      [ship.id (append-entropy name.id)]
    cor(events (~(put by events) id event))
  ::  +delete-event: permanently delete an event
  ::
  ++  delete-event
    ^+  cor
    ?>  host-call
    cor(events (~(del by events) id))
  ::  +require-app: toggle on/off application requirement
  ::
  ++  require-app
    |=  toggle=?
    ^+  cor
    ?>  host-call
    =/  =event  get-event
    =.  require-application.event  toggle
    (update-event event)
  ::  +set-info: update an event's metadata and publish to all
  ::  event guests
  ::
  ++  set-info
    |=  update=info
    ^+  cor
    ?>  host-call
    =/  =event  get-event
    =.  info.event  update
    =.  cor  (update-event event)
    :: TODO if event title changes, update chat titles
    =+  guests=get-guests
    |-
    ?~  guests  cor
    =/  =record
      (~(got bi records) id i.guests)
    =.  info.record  update
    =.  cor
      (~(publish re i.guests) record)
    $(guests t.guests)
  ::  +set-secret: set and send an event's secret
  ::
  ++  set-secret
    |=  new-secret=(unit cord)
    ^+  cor
    ?>  host-call
    =/  =event  get-event
    =.  secret.event
      new-secret
    =.  cor  (update-event event)
    =,  event
    (update-guests secret chat get-guests)
  ::  +set-limit: restrict number of registered guests
  ::
  ++  set-limit
    |=  new-limit=limit
    ^+  cor
    ?>  host-call
    =;  write=?
      ?.  write
        ~|(limit-lower-than-registered-count+id !!)
      =/  =event  get-event
      =.  limit.event
        new-limit
      (update-event event)
    ?~  new-limit  &
    (gte u.new-limit registered-count)
  ::  +add-chat: connect an existing chat or create a new one
  ::
  ++  add-chat
    |=  chat-id=(unit club-id)
    |^  ^+  cor
    ?>  host-call
    :: if nothing is passed in, create a new chat id
    =/  gab=(unit club-id)
      ?~(chat-id create-id chat-id)
    :: add the chat to event state
    =/  =event  get-event
    =.  chat.event  gab
    =.  cor
      (update-event event)
    =.  cor
      :: create a new chat, if none was passed in
      ?~  chat-id
        (create-chat gab)
      :: check for existence
      =/  =crew:club:chat
        %^  scry-for  crew:club:chat
          %chat
        /club/(scot %uv p.u.chat-id)/crew
      ?.  &(=(~ team.crew) =(~ hive.crew))
        invite-registered
      ~|(no-chat-exists+[id p.u.chat-id] !!)
    =,  event
    (update-guests secret chat get-guests)
    ::  +invite-registered: send group chat invite to %registered guests
    ::
    ++  invite-registered
      ^+  cor
      =/  guests=(list ship)
        get-registered-guests
      |-
      ?~  guests  cor
      =.  cor  (invite-to-chat i.guests)
      $(guests t.guests)
    ::  +create-id: make a group chat id
    ::
    ++  create-id
      ^-  (unit club-id)
      =;  club=id:club:chat
        (some `club-id`[%club club])
      %+  slav  %uv
      %-  crip
      :: we match %chat's club id pattern; not entirely sure why it's
      :: like this
      (weld "0v4.00000." (swag [12 23] (scow %uv eny.bowl)))
    ::  +create-chat: generate chat and invite %registered guests
    ::
    ++  create-chat
      |=  chat-id=(unit club-id)
      ^+  cor
      ?~  chat-id  cor
      =/  =wire  (weld /chat id-to-path)
      =/  guests=(set ship)
        (silt get-registered-guests)
      %-  emil
      :~  %:  act
            wire
            our.bowl
            %chat
            :-  %club-action
            !>  ^-  action:club:chat
            :+  p.u.chat-id
              *uid:club:chat
            [%meta [title.info:get-event *cord *cord *cord]]
          ==
          %:  act
            wire
            our.bowl
            %chat
            club-create+!>(`create:club:chat`[p.u.chat-id guests])
          ==
      ==
    --
  ::  +remove-chat: unlink a chat channel from an event
  ::
  ++  remove-chat
    ^+  cor
    ?>  host-call
    =/  =event  get-event
    =.  chat.event  ~
    =.  cor
      (update-event event)
    =,  event
    (update-guests secret chat get-guests)
  ::  +subscribe: a request from a host ship to subscribe to record updates
  ::
  ++  subscribe
    ^+  cor
    ::  must come from host
    ?>  =(src.bowl ship.id)
    ::  must be foreign, and a host cannot sub to their own event
    ?<  |(=(our.bowl src.bowl) =(our.bowl ship.id))
    %-  sss-sub-records
    (surf:da-records src.bowl dap.bowl [%records %guest our.bowl ~])
  ::  +apply: application to a restricted event
  ::
  ++  apply
    |=  application=cord
    ^+  cor
    ?>  guest-call
    =/  =event  get-event
    ?>  ?=(%open status.info.event)
    ?.  require-application.event
      ~|(application-not-required+id !!)
    :: applications must come before any other record status
    ?:  (~(has bi records) id src.bowl)  cor
    =.  cor
      (ask-to-sub src.bowl)
    (~(new-record re src.bowl) [%applied now.bowl] `application)
  ::  +register: permit event access
  ::
  ::    a guest can register themselves or the host ship can do so on their
  ::    behalf
  ::
  ++  register
    |=  who=(unit ship)
    ^+  cor
    =/  =event  get-event
    ?>  ?=(%open status.info.event)
    ?<  ?~  limit.event  |
        =(u.limit.event registered-count)
    =/  =ship
      ?:  host-call
        ?~(who !! u.who)
      ?>(guest-call src.bowl)
    ?>  ?.  require-application.event  &
        (~(status-exists re ship) %applied)
    =.  cor
      (invite-to-chat ship)
    ?.  (~(has bi records) id ship)
      :: ask to subscribe and create a new record for the ship
      =.  cor
        (ask-to-sub ship)
      (~(new-record re ship) [%registered now.bowl] ~)
    :: add %registered status, if not already there
    ?:  ?|  ?=(%attended ~(current-status re ship))
            ?=(%registered ~(current-status re ship))
        ==
      cor
    (~(add-history re ship) [%registered now.bowl])

  ::  +unregister: revoke event access
  ::
  ++  unregister
    |=  who=(unit ship)
    ^+  cor
    =/  =event  get-event
    =/  =ship
      ?:  host-call
        ?~(who !! u.who)
      ?>(guest-call src.bowl)
    ?.  (~(has bi records) id ship)
      ~|(no-record+[id ship] !!)
    ?.  ?=(%registered ~(current-status re ship))
      ~|(not-registered+[id ship] !!)
    :: TODO %chat doesn't provide an option to remove a ship from a club
    (~(add-history re ship) [%unregistered now.bowl])
  ::  +punch: validate a guest's attendance
  ::
  ++  punch
    |=  =ship
    ^+  cor
    ?>  host-call
    ?.  ?=(%registered ~(current-status re ship))
      cor
    (~(add-history re ship) [%attended now.bowl])
  ::  +delete-record: permanently delete a guest's record
  ::
  ++  delete-record
    |=  =ship
    ^+  cor
    ?>  host-call
    =.  records  (~(del bi records) id ship)
    (sss-pub-records (kill:du-records [%records %guest ship ~]~))
  ::  +update-guests: publish an update to a specified set of guests
  ::
  ++  update-guests
    |=  $:  new-secret=(unit cord)
            new-chat=(unit club-id)
            guests=(list ship)
        ==
    |-  ^+  cor
    ?~  guests  cor
    ?.  ?=(%registered ~(current-status re i.guests))
      $(guests t.guests)
    =/  =record  (~(got bi records) id i.guests)
    =:  chat.record    new-chat
        secret.record  new-secret
      ==
    =.  cor  (~(publish re i.guests) record)
    $(guests t.guests)
  ::  +invite-to-chat: invite a guest to the event's chat
  ::
  ++  invite-to-chat
    |=  =ship
    ^+  cor
    =/  =event  get-event
    ?~  chat.event  cor
      :: TODO also make sure chat exists in %chat agent
    =/  =wire
      :(weld /chat id-to-path /(scot %p ship))
    =.  cor
      %-  emit
      %:  act
        wire
        ship
        %chat
        :-  %club-action
        !>  ^-  action:club:chat
        [p.u.chat.event *uid:club:chat [%hive our.bowl ship &]]
      ==
    cor
  ::  +ask-to-sub: send a subscribe poke to a ship
  ::
  ++  ask-to-sub
    |=  =ship
    ^+  cor
    =/  =wire  (weld /subscribe id-to-path)
    %-  emit
    (act wire ship %live (make-event-operation id [%subscribe ~]))
  ::  +get-event: retreive an event
  ::
  ++  get-event
    ^-  event
    ~|(no-event-found+id (~(got by events) id))
  ::  +get-guests: retreive guests for an event
  ::
  ++  get-guests
    ^-  (list ship)
    ~(tap in (~(key bi records) id))
  ::  $get-registered-guests: produce set of all registered guests
  ::
  ++  get-registered-guests
    ^-  (list ship)
    %+  murn  get-guests
    |=  =ship
    ?.(?=(%registered ~(current-status re ship)) ~ `ship)
  ::  +registered-count: produce number of registered guests
  ::
  ++  registered-count
    ^-  @ud
    =/  guests=(list ship)
      get-guests
    =|  count=@ud
    |-
    ?~  guests  count
    ?.  ?=(%registered ~(current-status re i.guests))
      $(guests t.guests)
    $(count +(count), guests t.guests)
  ::  +re: record handling
  ::
  ++  re
    |_  guest=ship
    ::  $publish: update local records map and publish for guest
    ::
    ++  publish
      |=  =record
      ^+  cor
      =.  records
        (~(put bi records) id guest record)
      =+  path=[%records %guest guest ~]
      %-  sss-pub-records
      (give:du-records path id record)
    ::  +new-record: create a guest record and publish it
    ::
    ++  new-record
      |=  $:  status=[record-status time]
              application=(unit cord)
          ==
      ^+  cor
      =+  path=[%records %guest guest ~]
      =/  =record
        :: if applicaiton is not empty, we don't pass secret or chat
        ::
        =,  get-event
        ?^  application
          [info application [status]~ ~ ~]
        [info application [status]~ secret chat]
      :: make path secret
      =.  cor
        (sss-pub-records (secret:du-records [path]~))
      :: permission the guest for access
      =.  cor
        (sss-pub-records (allow:du-records [guest]~ [path]~))
      :: give the guest the record
      (~(publish re guest) record)
    ::  +add-history: add to record history
    ::
    ++  add-history
      |=  new-status=[record-status time]
      ^+  cor
      =/  =record
        ~|  no-record+[id guest]
        (~(got bi records) id guest)
      =.  history.record
        [new-status history.record]
      (~(publish re guest) record)
    ::  +status-exists: confirm status existence
    ::
    ++  status-exists
      |=  =record-status
      ^-  ?
      =+  ~|  no-record+[id guest]
          history=history:(~(got bi records) id guest)
      |-
      ?~  history  |
      ?:  =(record-status p.i.history)  &
      $(history t.history)
    :: +current-status: determine a guest's current status
    ::
    ++  current-status
      ^-  record-status
      ~|  no-record+[id guest]
      =+  history:(~(got bi records) id guest)
      ?~(- !! p.i.-)
    --
  --
--
::  +act: build poke card
::
++  act
  |=  [=wire who=ship app=term =cage]
  ^-  card
  [%pass wire %agent [who app] %poke cage]
::  +make-event-operation: produce an event-operation cage
::
++  make-event-operation
  |=  [=id =event-action]
  ^-  cage
  live-event-operation+!>(`event-operation`[id event-action])
::  +append-entropy: add random chars to event name for uniqueness
::
++  append-entropy
  |=  name=term
  ^-  term
  %+  slav  %tas
  %-  crip
  :(weld (scow %tas name) "-" (swag [6 5] (scow %uv eny.bowl)))
::
++  scry-for-marked
  |*  [=mold app=term =path]
  .^(mold %gx (scot %p our.bowl) app (scot %da now.bowl) path)
::
++  scry-for
  |*  [=mold app=term =path]
  (scry-for-marked mold app (snoc `^path`path %noun))
--
