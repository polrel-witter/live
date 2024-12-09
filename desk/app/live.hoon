::  %live: event coordination
::
/-  *live, matcher, lr=live-records, hark, contacts
/+  *sss, *mip, verb, dbug, default-agent
::
|%
::
+$  versioned-state  $%(state-0 state-1)
::
+$  state-0
  $:  %0
      events=(map id event)                               :: events we host
      records=(mip id ship record)                        :: guests & passes
      result=$@(@t (map id info))                         :: search result
      sub-records=_(mk-subs records:lr ,[%record @ @ ~])  :: record subs
      pub-records=_(mk-pubs records:lr ,[%record @ @ ~])  :: record pubs
 ==
+$  state-1
  $:  %1
      events=(map id event-1)                               :: events we host
      records=(mip id ship record-1)                        :: access data
      result=$@(@t (map id info-1))                         :: search result
      sub-records=_(mk-subs records-1:lr ,[%record @ @ ~])  :: record subs
      pub-records=_(mk-pubs records-1:lr ,[%record @ @ ~])  :: record pubs
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
=<  |_  =bowl:gall
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
    du-records    =/  du  (du records-1:lr ,[%record @ @ ~])
                  (du pub-records bowl -:!>(*result:du))
    da-records    =/  da  (da records-1:lr ,[%record @ @ ~])
                  (da sub-records bowl -:!>(*result:da) -:!>(*from:da) -:!>(*fail:da))
::
++  emit  |=(=card cor(cards [card cards]))
++  emil  |=(caz=(list card) cor(cards (weld (flop caz) cards)))
++  abet  ^-((quip card _state) [(flop cards) state])
++  bran  |=(=tape (weld "%live: " tape))
::  success case
++  succ  |=(=path (give-local-update path [%error ~]))
::  failure case
++  fail  |=([=path msg=(unit cord)] (give-local-update path [%error msg]))
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
++  init  ^+(cor cor)
::
++  load
  |=  =vase
  |^  ^+  cor
  =+  !<(ole=versioned-state vase)
  ?-    -.ole
      %1  cor(state ole)
      %0
    =.  cor
      ::  unbind URL path; %live 1.0 was handling http-requests directly
      ::  whereas 2.0 uses Eyre channels
      ::
      %-  emit
      [%pass /eyre/connect %arvo %e %disconnect [~ /apps/live]]
    %=  cor
      state   :*  %1
                  ::  convert events and add them to %matcher
                  ::
                  =/  morphed=(map id event-1)
                    (~(urn by events.ole) event-0-to-1)
                  =/  ml=(list [=id event-1])
                    ~(tap by morphed)
                  |-  ^+  morphed
                  ?~  ml  morphed
                  =.  cor
                    %+  poke-matcher
                      /matcher/(scot %p our.bowl)/add
                    [id.i.ml [%add-peer our.bowl]]
                  $(ml t.ml)
                  ::  convert records and add guests to %matcher with a
                  ::  %registered or %attended status
                  ::
                  ^-  (mip id ship record-1)
                  =/  ls
                    ^-  (list (trel id ship record-1))
                    (turn ~(tap bi records.ole) record-0-to-1)
                  =|  ms=(mip id ship record-1)
                  |-
                  ?~  ls  ms
                  =?  cor  ?&  =(our.bowl ship.p.i.ls)
                               ?=(?(%registered %attended) p.status.r.i.ls)
                           ==
                    %+  poke-matcher
                      /matcher/(scot %p q.i.ls)/add
                    [p.i.ls [%add-peer q.i.ls]]
                  $(ls t.ls, ms (~(put bi ms) p.i.ls q.i.ls r.i.ls))
                  ::  convert result
                  ::
                  ^-  $@(@t (map id info-1))
                  ?@  result.ole
                    result.ole
                  ^-  (map id info-1)
                  %-  malt
                  ^-  (list [id info-1])
                  =/  ls=(list [id info])
                    ~(tap by ;;((map id info) result.ole))
                  ^-  (list [id info-1])
                  %+  turn  `(list [id info])`ls  result-0-to-1
                  ::  convert subscription and publication state
                  ::
                  (sub-records-0-to-1 sub-records.ole)
                  (pub-records-0-to-1 pub-records.ole)
    ==        ==
  ==
  ::
  ++  event-0-to-1
    |=  [k=id v=event]
    ^-  event-1
    [(info-0-to-1 info.v) secret.v limit.v]
  ::
  ++  result-0-to-1
    |=  [k=id v=info]
    ^-  [id info-1]
    [k (info-0-to-1 v)]
  ::
  ++  info-0-to-1
    |=  =info
    ^-  info-1
    =/  [start=(unit time) end=(unit time) =timezone]
      moment.info
    :-  title.info
    [about.info [start end] timezone ~ ~ ~ kind.info latch.info ~]
  ::
  ++  record-0-to-1
    |=  [k0=id k1=ship v=record]
    ^-  [id ship record-1]
    :+  k0
      k1
    [(info-0-to-1 info.v) secret.v status.v]
  ::
  ++  sub-records-0-to-1
    |=  subs=_(mk-subs records:lr ,[%record @ @ ~])
    ^+  sub-records
    =|  key=[ship dude [%record @ @ ~]]
    =|  val=(unit [aeon=@ud stale=? fail=? =rock:records:lr])
    :-  %0
    %-  malt
    ^-  (list [_key (unit [@ud ? ? rock:records-1:lr])])
    %+  turn  ~(tap by `(map _key _val)`+.subs)
    |=  [k=_key v=_val]
    ^-  [_key (unit [@ud ? ? rock:records-1:lr])]
    ?~  v  [k ~]
    =/  r=record
      record.rock.u.v
    :-  k
    `[aeon.u.v stale.u.v fail.u.v [(info-0-to-1 info.r) secret.r status.r]]
  ::
  +$  trok  ((mop aeon rock:records-1:lr) gte)
  +$  twav  ((mop aeon wave:records-1:lr) lte)
  +$  tide
    $:  rok=((mop aeon rock:records:lr) gte)
        wav=((mop aeon wave:records:lr) lte)
        rul=[horizon=(unit @ud) frequency=@ud]
        mem=(jug ship dude)
    ==
  +$  buoy  [tid=$~(*tide $@(aeon tide)) alo=(unit (set ship))]
  ::
  ++  pub-records-0-to-1
    |=  pubs=_(mk-pubs records:lr ,[%record @ @ ~])
    |^  ^+  pub-records
    ?:  =(~ +.pubs)      *_pub-records
    ?.  ?=([%1 ^] pubs)  *_pub-records
    =|  paths=[%record @ @ ~]
    =<  -
    %+  ~(rib by `(map _paths buoy)`+.pubs)
      *_pub-records
    |=  [[k=_paths v=_q.n.+.pubs] acc=_pub-records]
    ?>  ?=(^ v)
    ?>  ?=(%1 -.acc)
    :_  [k v]
    :-  -.acc
    %+  ~(put by +.acc)  k
    :_  `(unit (set ship))`alo.v
    ?@  tid.v  `@ud`tid.v
    ^-  [trok twav [(unit @ud) @ud] (jug ship term)]
    =/  rok=trok
      %+  gas:((on aeon rock:records-1:lr) gte)  *trok
      (turn (tap:((on aeon rock:records:lr) gte) rok.tid.v) srec)
    =/  wav=twav
      %+  gas:((on aeon wave:records-1:lr) lte)  *twav
      (turn (tap:((on aeon wave:records:lr) lte) wav.tid.v) srec)
    [rok wav rul.tid.v mem.tid.v]
    ::
    ++  srec
      |=  [k=aeon v=record]
      :-  k
      [(info-0-to-1 info.v) secret.v status.v]
    --
  --
::
++  watch
  |=  pol=(pole knot)
  ^+  cor
  ?>  (team:title our.bowl src.bowl)
  ?+  pol  ~|(bad-watch+pol cor)
    [%error @ ~]  cor
    [%search ~]   cor
    [%updates ~]  cor
  ==
::
++  agent
  |=  [=wire =sign:agent:gall]
  ^+  cor
  ?+    wire  cor
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
  ::
      [%matcher @ *]
    ?>  ?=(%poke-ack -.sign)
    =/  =ship  (slav %p i.t.wire)
    ?+    t.t.wire  ~|(bad-wire+wire cor)
        [%add ~]
      ?~  p.sign  cor
      ~&(>>> (bran "failed to add {<ship>} as peer in %matcher") cor)
    ::
        [%delete ~]
      ?~  p.sign  cor
      ~&(>>> (bran "failed to remove {<ship>} from %matcher") cor)
    ==
  ::
      [%case %request @ @ ~]
    =/  =ship      (slav %p i.t.t.wire)
    =/  name=term  (slav %tas i.t.t.t.wire)
    ?>  ?=(%poke-ack -.sign)
    ?~  p.sign  cor
    =;  msg=tape
      =.  result  (crip msg)
      (give-local-update /search [%result ship `name result])
    ?:  =('all' name)
      ~['No events found under' ' ' (scot %p ship)]
    ~[(crip "'{<name>}'") ' not found under ' (scot %p ship)]
  ::
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
      [%status-change %timer @ @ @ ~]
    =/  =ship      (slav %p i.t.t.wire)
    =/  name=term  (slav %tas i.t.t.t.wire)
    =/  act=?(%register %unregister)
      ;;(?(%register %unregister) (slav %tas i.t.t.t.t.wire))
    =/  rec=(unit record-1)
      (~(get bi records) [ship name] our.bowl)
    =;  notify=?
      ?.  notify  cor
      %+  fail  /error/status-change
      `'could not process status change, host could be offline'
    ?~  rec  %&
    ?-  act
      %unregister  ?!(?=(%unregistered p.status.u.rec))
      %register    ?!(?=(?(%requested %registered) p.status.u.rec))
    ==
  ::
      [%remote %scry *]
    ?+    t.t.wire    ~|(bad-wire+wire !!)
        ?([%all ~] [%event @ ~])
      ?.  ?=([%ames %tune *] sign-arvo)
        ~|(unexpected-system-response+sign-arvo !!)
      =/  msg  'No events found'
      =;  rev=_result
        =?  rev  ?~(rev & |)  msg
        =.  result  rev
        =/  =ship  ship.sign-arvo
        =/  name=(unit term)
          =/  =term  -:(flop path.sign-arvo)
          ?:(?=(%all term) ~ `term)
        (give-local-update /search [%result ship name result])
      ?~  roar.sign-arvo  msg
      =/  =roar:ames      u.roar.sign-arvo
      ?~  q.dat.roar      msg
      ;;((map id info-1) +.u.q.dat.roar)
    ::
        [%timer @ @ @ *]
      =/  [end=path name=(unit term)]
        ?+    t.t.t.t.t.t.wire  ~|(bad-wire+wire !!)
            [%all ~]      [//all ~]
            [%event @ ~]
          =/  =term  i.t.t.t.t.t.t.wire
          [//event/(scot %tas term) `term]
        ==
      ?+    t.t.t.t.wire  ~|(bad-wire+wire !!)
          [%case *]
        =/  =ship     (slav %p i.t.t.t.wire)
        =/  case=@ud  (slav %ud i.t.t.t.t.t.wire)
        =/  =spur     (weld /g/x/(scot %ud case)/live end)
        (emit [%pass /remote/scry/cancel %arvo %a %yawn ship spur])
      ::
          [%response *]
        =/  =ship     (slav %p i.t.t.t.wire)
        :: hash the current result and compare with the hash in the path
        :: if it's different, we assume a response so we do nothing,
        :: else we modify the result and notify the user
        ::
        =/  old-hash=@ux  (slav %ux i.t.t.t.t.t.wire)
        ?.  =(old-hash `@ux`(mug result))  cor
        =.  result
          %-  crip
          %+  weld
            ?~  name  ~['No events found under' ' ' (scot %p ship)]
            ~[(crip "'{<u.name>}'") ' not found under ' (scot %p ship)]
          ". The host could be offline."
        (give-local-update /search [%result ship name result])
      ==
    ==
  ==
::
++  peek
  |=  pol=(pole knot)
  ^-  (unit (unit cage))
  =;  =demand
    ``[%live-demand !>(demand)]
  ?+    pol  ~|(invalid-scry-path+pol !!)
      [%x %result ~]          [%result result]
      [%x %events %all ~]     [%all-events events]
      [%x %records %all ~]    [%all-records records]
      [%x %events %remote ~]  [%remote-events get-remote-events]
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
      [%x %session %ids host=@ name=@ ~]
    :-  %session-ids
    =/  e=event-1
      (~(got by events) (slav %p host:pol) (slav %tas name:pol))
    ^-  (list [term cord])
    %+  turn  ~(tap by sessions.info.e)
    |=  [=term =session]
    [term title.session]
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
    =/  cnt=(map stage @ud)
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
    ?-    -.dial
        %find           (search +.dial)
        %case-request   (case-request +.dial)
        %case-response  (case-response +.dial)
    ==
  ::
      %sss-to-pub
    =/  msg  !<(into:du-records (fled vase))
    (sss-pub-records (apply:du-records msg))
  ::
      %sss-live-records-1
    =/  msg  !<(into:da-records (fled vase))
    (sss-sub-records (apply:da-records msg))
  ::
      %sss-fake-on-rock
    =/  msg  !<(from:da-records (fled vase))
    ?>  ?=([[%record @ @ ~] *] msg)
    (emil (handle-fake-on-rock:da-records msg))
  ::
      %sss-on-rock
    |^
    =/  msg  !<(from:da-records (fled vase))
    ?>  ?=([[%record @ @ ~] *] msg)
    ?>  =(our.bowl `ship`+>-:path.msg)
    =/  name=term  +<:path.msg
    =/  rev=record-1
      ?~(wave.msg rock.msg u.wave.msg)
    :: clear secret if we're not %registered or %attended since it
    :: might diverge otherwise
    ::
    =?  secret.rev  ?=  ?(%invited %requested %unregistered)
                    p.status.rev
      ~
    =/  current=(unit record-1)
      (~(get bi records) [src.msg name] our.bowl)
    =.  cor
      (give-local-update /updates [%record [src.msg name] our.bowl rev])
    =?  cor  (notify current rev)
      (emit (make-hark src.msg title.info.rev status.rev))
    cor(records (~(put bi records) [src.msg name] our.bowl rev))
    ::  +notify: push notification to Landscape, if we've been %invited or our
    ::  status goes from %requested to %registered
    ::
    ++  notify
      |=  [current=(unit record-1) rev=record-1]
      ^-  ?
      ?|  ?~  current
            ?=(%invited p.status.rev)
              :: if our current status is %invited, don't notify
              ::
          ?|  ?&  ?=(%invited p.status.rev)
                  ?!(?=(%invited p.status.u.current))
              ==
              ?&  ?=(%requested p.status.u.current)
                  ?=(%registered p.status.rev)
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
::  +make-act: build poke card
::
++  make-act
  |=  [=wire who=ship app=term =cage]
  ^-  card
  [%pass wire %agent [who app] %poke cage]
::  +give-local-update: produce a local $update
::
++  give-local-update
  |=  [=path upd=update]
  ^+  cor
  %-  emit
  [%give %fact ~[path] live-update+!>(`update`upd)]
::  +make-operation: produce an $operation cage
::
++  make-operation
  |=  [=id =action]
  ^-  cage
  live-operation+!>(`operation`[id action])
::  +poke-matcher: send a dictum poke to %matcher
::
++  poke-matcher
  |=  [=wire dict=dictum:matcher]
  ^+  cor
  =/  =cage
    matcher-dictum+!>(`dictum:matcher`dict)
  %-  emit
  (make-act wire our.bowl %matcher cage)
::  +append-entropy: add random characters to a name for uniqueness
::
++  append-entropy
  |=  [salt=@ud name=term]
  ^-  term
  %+  slav  %tas
  %-  crip
  ;:  weld
    (scow %tas name)
    "-"
    (swag [6 4] (scow %uv ?~(salt eny.bowl (mul eny.bowl salt))))
  ==
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
      ?~(`(map id info-1)`get-remote-events %| %&)
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
  ^-  (map id info-1)
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
    =.  result  'See home page for our events'
    (give-local-update /search [%result ship name result])
  =/  =wire
    %+  weld  /case/request/(scot %p ship)
    ?~  name  /all
    /(scot %tas u.name)
  ::  poke ship and set a timer to notify user if we get no response
  ::
  %-  emil
  :~  (make-act wire ship dap.bowl live-dial+!>(`dial`[%case-request name]))
      :*  %pass
          ;:  weld  /remote/scry/timer/(scot %p ship)/response
            /(scot %ux `@ux`(mug result))
            ?~  name  /all
            /event/(scot %tas u.name)
          ==
          %arvo  %b
          %wait  (add ~s30 now.bowl)
      ==
  ==
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
    :: no case provided means there are no discoverable events at
    :: the path in question
    ::
    =;  msg=tape
      =.  result  (crip msg)
      (give-local-update /search [%result src.bowl name result])
    ?~  name
      ~['No events found under' ' ' (scot %p src.bowl)]
    ~[(crip "{<(scow %tas u.name)>}") ' not found under ' (scot %p src.bowl)]
  :: perform the scry and set a timer to cancel it
  ::
  %-  emil
  :~  :*  %pass
          %+  weld  /remote/scry/timer/(scot %p src.bowl)/case/(scot %ud u.case)
          ?~  name  /all
          /event/(scot %tas u.name)
          %arvo  %b
          %wait  (add ~s30 now.bowl)
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
  ::  +get-all-record-ships: retreive all ships with a record for an event
  ::
  ++  get-all-record-ships
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
  ::  +latch-fail: pass local fail update due to an %over latch
  ::
  ++  latch-fail
    |=  =path
    %+  fail  path
    `'cannot process: this event is marked as %over'
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
  ::  +ask-to-subscribe: request that a guest subscribes to your event
  ::
  ++  ask-to-subscribe
    |=  =ship
    ^+  cor
    =/  =wire  (weld /subscribe id-to-path)
    =/  =cage  (make-operation id [%subscribe ~])
    (emit (make-act wire ship dap.bowl cage))
  ::  +set-timer: await status change confirmation from host
  ::
  ++  set-timer
    |=  act=?(%register %unregister)
    ^+  cor
    %-  emit
    :*  %pass
        %+  weld  /status-change/timer/(scot %p ship.id)/(scot %tas name.id)
        /(scot %tas act)
        %arvo  %b
        %wait  (add ~s30 now.bowl)
    ==
  ::  +sane: check whether a moment's start comes before end
  ::
  :: TODO if dates are equal, but have different entropy this will
  :: result in a negative asertion
  ++  sane
    |=  m=moment-1
    ^-  ?
    ?:  ?=([~ ~] m)  &
    ?.  ?=([^ ^] m)  &
    (lte (need start.m) (need end.m))
  ::  +moment-nests: check whether a moment exists within the bound of
  ::  another moment
  ::
  ++  moment-nests
    |=  [bound=moment-1 start=(unit time) end=(unit time)]
    ^-  ?
    ?&  ?~(start & (in-moment bound u.start))
        ?~(end & (in-moment bound u.end))
    ==
  ::  +in-moment: check whether some time is within the bounds of a
  ::  moment
  ::
  ++  in-moment
    |=  [bound=moment-1 =time]
    ^-  ?
    ?:  ?=([~ ~] bound)  &
    ?:  ?=([^ ^] bound)
      ?&  (gte time (need start.bound))
          (lte time (need end.bound))
      ==
    ?~  end.bound
      (gte time (need start.bound))
    (lte time (need end.bound))
  ::  +are-dates-bound: check if all session dates are within the bound
  ::  of a moment
  ::
  ++  are-dates-bound
    |=  [bound=moment-1 sessions=(map @tas =session)]
    ^-  ?
    :: if event moment is TBD ([~ ~]), session dates will pass now but the
    :: moment will be checked against them later when it's set
    ::
    ?:  ?=([~ ~] bound)  &
    ?.  (sane bound)
      ~&(>>> (bran "event moment is insane: {<bound>}") |)
    =|  not-sane=tape
    =|  not-bound=tape
    =/  ls=(list [sid=@tas s=session])
      ~(tap by sessions)
    |-
    ?~  ls
      ?.  =(~ not-sane)
        ~&(>>> (bran "these session moments are insane:") |)
      ?~  not-bound  &
      ~&  >>>
        %-  bran
        %+  weld  "these sessions are outside the bound of their event moment:"
        not-bound
      |
    ?.  (sane moment.s.i.ls)
      $(not-sane (weld not-sane " {<sid.i.ls>}: {<moment.s.i.ls>}"), ls t.ls)
    ?:  (moment-nests bound moment.s.i.ls)
      $(ls t.ls)
    $(not-bound (weld not-bound " {<sid.i.ls>}"), ls t.ls)
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
    =+  guests=get-all-record-ships
    |-
    ?~  guests  count
    =+  status=(need ~(current-status re i.guests))
    ?.  ?|  ?=(%registered p.status)
            ?=(%attended p.status)
        ==
      $(guests t.guests)
    $(count +(count), guests t.guests)
  ::  +get-ships-by-status: pull a list of ships by stage association
  ::
  ++  get-ships-by-status
    |=  stages=(set stage)
    ^-  (list ship)
    =/  event-records=(map ship record-1)
      ?~(r=(~(get by records) id) ~ u.r)
    %+  murn  ~(tap by event-records)
    |=  [s=ship r=record-1]
    ^-  (unit ship)
    ?.((~(has in stages) p.status.r) ~ `s)
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
  ::  +update-event: write an event change to state
  ::
  ++  update-event
    |=  rev=event-1
    ^+  cor
    =.  events  (~(put by events) id rev)
    =.  cor  (update-remote-event rev)
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
      |^  ^+  cor
      ?>  host-call
      =?  id  (~(has by events) id)
        [ship.id (append-entropy 0 name.id)]
      ?.  (are-dates-bound moment.info.event sessions.info.event)
        (fail /error/create `'event or session dates are not in bound')
      =.  sessions.info.event
        (malt (replace-ids ~(tap by sessions.info.event)))
      =.  events  (~(put by events) id event)
      =.  cor
        %+  poke-matcher
          /matcher/(scot %p our.bowl)/add
        [id [%add-peer our.bowl]]
      =.  cor  (update-remote-event event)
      =.  cor  update-all-remote-events
      (succ /error/create)
      ::  +replace-ids: session ids inheret name.id and some entropy
      ::
      ++  replace-ids
        |=  in=(list [term =session])
        ^+  in
        =+  salt=1
        =|  out=(list [term session])
        |-  ?~  in  out
        =;  sid=term
          $(out [[sid session.i.in] out], salt +(salt), in t.in)
        %+  slav  %tas
        %-  crip
        (weld (scow %tas (append-entropy salt name.id)) "-s")
      --
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
      =.  cor  (update-guests get-all-record-ships)
      =.  cor  update-all-remote-events
      =.  events  (~(del by events) id)
      :: if no discoverable events, also cull the /all path so others get a nack
      :: when they search for them
      ::
      =?  cor  ?~((get-our-case ~) %| %&)
        (delete-remote-path (need (get-our-case ~)) /all)
      =.  cor  delete-records
      (succ /error/delete)
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
      |=  sub-info=sub-info-1
      |^  ^+  cor
      ?>  host-call
      :: if event is %over, only allow a %latch modification
      ::
      ?:  &(?!(?=(%latch -.sub-info)) over)
        (latch-fail /error/edit)
      =/  new-cor=(unit _cor)
        (ingest-diff sub-info)
      ?~  new-cor
        (fail /error/edit `'failed to process edit')
      =.  cor  u.new-cor
      =/  case=(unit @ud)  (get-our-case `name.id)
      =?  cor  ?~(case %| %&)
        (delete-remote-path (need case) /event/(scot %tas name.id))
      =.  cor  (succ /error/edit)
      =+  event=get-event
      =.  cor  (give-local-update /updates [%event id event])
      :: if event is %secret only update %invited, %registered, and
      :: %attended, otherwise send the update to all ships with a
      :: record
      ::
      %-  update-guests
      ?.  ?=(%secret kind.info.event)  get-all-record-ships
      %-  get-ships-by-status
      (silt `(list stage)`~[%invited %registered %attended])
      ::  +session-moment-nests: does a session moment nest within the
      ::  bound of its event moment?
      ::
      ++  session-moment-nests
        |=  session-moment=moment-1
        ^-  ?
        ?.  (sane session-moment)
          ~&(>>> (bran "session moment is insane: {<session-moment>}") |)
        =/  bound=moment-1  moment.info:get-event
        ?:  (moment-nests bound session-moment)  &
        ~&  >>>
          %-  bran
          %+  weld
            "session moment is not within the bound of the event moment, "
          "which starts {<start.bound>} and ends {<end.bound>}"
        |
      ::  +ingest-diff: write the diff to state
      ::
      ++  ingest-diff
        |=  sub-info=sub-info-1
        ^-  (unit _cor)
        =/  event=event-1  get-event
        ?-    -.sub-info
            %title      `(update-event event(title.info p.sub-info))
            %about      `(update-event event(about.info p.sub-info))
            %location   `(update-event event(location.info p.sub-info))
            %venue-map  `(update-event event(venue-map.info p.sub-info))
            %group      `(update-event event(group.info p.sub-info))
            %timezone   `(update-event event(timezone.info p.sub-info))
        ::
            %moment
          ?.  (are-dates-bound p.sub-info sessions.info.event)  ~
          `(update-event event(moment.info p.sub-info))
        ::
            %delete-session
          =/  sid=@tas  p.sub-info
          %-  some
          %-  update-event
          event(sessions.info (~(del by sessions.info.event) sid))
        ::
            %latch
          :: if limit is reached, prevent host from opening
          ::
          ?:  ?&  ?=(%open p.sub-info)
                  ?~(limit.event | =(u.limit.event permitted-count))
              ==
            ~&(>>> (bran "cannot open: event limit is reached") ~)
          `(update-event event(latch.info p.sub-info))
        ::
            %create-session
          =/  sid=@tas
            :: all session ids inheret the name of the parent event, but
            :: have unique entropy and a '-s' appended to them
            ::
            %+  slav  %tas
            %-  crip
            (weld (scow %tas (append-entropy 0 name.id)) "-s")
          =/  =session  p.sub-info
          ?.  (session-moment-nests moment.session)  ~
          %-  some
          %-  update-event
          event(sessions.info (~(put by sessions.info.event) sid session))
        ::
            %kind
          =/  new-kind=kind  p.sub-info
          =.  cor
            =+  event=get-event
            =/  targets=(list ship)
              %-  get-ships-by-status
              (silt `(list stage)`~[%requested %unregistered])
            ?.  ?=(?(%public %private) kind.info.event)
              ?.  ?=(?(%public %private) new-kind)  cor
              ::  ask all records with a %requested or %unregistered
              ::  status to resubscribe to their record since the event
              ::  is no longer secret
              ::
              |-  ?~  targets  cor
              =.  cor  (ask-to-subscribe i.targets)
              $(targets t.targets)
            ?.  ?=(%secret new-kind)  cor
            ::  kill paths for all records with a %reguested or
            ::  %unregistered status so they don't receive updates, and
            ::  let them know the $kind changed
            ::
            |-  ?~  targets  cor
            =.  cor
              =/  r=record-1
                (~(got bi records) id i.targets)
              =.  kind.info.r  new-kind
              (~(publish re i.targets) r)
            =.  cor
              %-  sss-pub-records
              (kill:du-records [%record name.id i.targets ~]~)
            $(targets t.targets)
          `(update-event event(kind.info new-kind))
        ::
            %edit-session
          =/  sid=@tas  p.sub-info
          =/  ses=(unit session)
            (~(get by sessions.info.event) sid)
          ?~  ses  ~&(>>> (bran "no session found for sid {<sid>}") ~)
          =;  rev=(unit session)
            ?~  rev  ~
            %-  some
            %-  update-event
            event(sessions.info (~(put by sessions.info.event) sid u.rev))
          ?-    -.q.sub-info
              %title      `u.ses(title p.q.sub-info)
              %panel      `u.ses(panel p.q.sub-info)
              %location   `u.ses(location p.q.sub-info)
              %about      `u.ses(about p.q.sub-info)
              %moment
            ?.  (session-moment-nests p.q.sub-info)  ~
            `u.ses(moment p.q.sub-info)
          ==
        ==
      --
    ::  +change-limit: update register limit
    ::
    ++  change-limit
      |=  new-limit=limit
      ^+  cor
      ?>  host-call
      ?:  over  (latch-fail /error/edit)
      =;  write=?
        ?.  write
          =+  msg="new limit is lower than the registered count"
          ~&  >>>  (bran msg)
          (fail /error/edit `(crip msg))
        =/  event=event-1  get-event
        =.  limit.event  new-limit
        =.  cor  (update-event event)
        (succ /error/edit)
      ?~  new-limit  &
      (gte u.new-limit permitted-count)
    ::  +change-secret: update the event secret and publish to
    ::  %registered and %attended guests
    ::
    ++  change-secret
      |=  new-secret=secret
      ^+  cor
      ?>  host-call
      ?:  over  (latch-fail /error/edit)
      =/  event=event-1  get-event
      =.  secret.event  new-secret
      =.  cor  (update-event event)
      =+  guests=get-all-record-ships
      =|  permitted=(list ship)
      |-
      ?~  guests
        =.  cor  (update-guests permitted)
        (succ /error/edit)
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
      ::
      ?:  &(=(our src):bowl ?!(=(our.bowl ship.id)))  ship.id
      :: if the source is the host, which is not us, sub to the source
      ::
      ?>  &(=(src.bowl ship.id) ?!(=(our.bowl ship.id)))  src.bowl
    ::  +invite: send an event invite to a list of ships
    ::
    ++  invite
      |=  ships=(list ship)
      ^+  cor
      ?>  host-call
      ?:  over  (latch-fail /error/status-change)
      |-  ?~  ships  cor
      =.  cor  (ask-to-subscribe i.ships)
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
        =.  cor  (set-timer %register)
        (emit (make-act wire ship.id dap.bowl cage))
      :: poke from host or some foreign ship
      ?:  over
        ?.(=(src our):bowl cor (latch-fail /error/status-change))
      =/  event=event-1  get-event
      =/  =ship  ?~(who src.bowl u.who)
      =.  cor  (ask-to-subscribe ship)
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
        (update-guests get-all-record-ships)
      =?  cor  ?=(%registered p.status)
        ::  add to %matcher
        ::
        (poke-matcher /matcher/(scot %p ship)/add [id [%add-peer ship]])
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
        ::
        =/  =wire  (weld /unregister id-to-path)
        =/  =cage
          (make-operation id [%unregister ~])
        =.  cor  (set-timer %unregister)
        (emit (make-act wire ship.id %live cage))
      :: unregister poke from some guest or us as the host
      ::
      ?:  over
        ?.(=(src our):bowl cor (latch-fail /error/status-change))
      =?  who  ?~(who & ?>(host-call |))
        ?>(guest-call `src.bowl)
      ?.  (is-registered (need who))  cor
      =.  cor
        ::  remove from %matcher peers
        ::
        %+  poke-matcher
          /matcher/(scot %p (need who))/delete
        [id [%delete-peer (need who)]]
      ::  update their status and kill the pub path so the guest doesn't
      ::  receive event updates
      ::
      =.  cor
        (~(update-status re (need who)) [%unregistered now.bowl])
      =+  event=get-event
      =?  cor  ?=(%secret kind.info.event)
        (sss-pub-records (kill:du-records [%record name.id (need who) ~]~))
      cor
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
      ?:  over  (latch-fail /error/status-change)
      ?~  sts=~(current-status re ship)  cor
      =;  rev=(unit status)
        ?~  rev
          %+  fail  /error/status-change
          `'guest status is not %registered or %attended'
        (~(update-status re ship) u.rev)
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
        :: pass local update
        =.  cor  (give-local-update /updates [%record id ship record])
        =.  cor  (succ /error/status-change)
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
      =.  cor  (sss-pub-records (secret:du-records [path]~))
      :: permission the guest for access
      =.  cor  (sss-pub-records (allow:du-records [ship]~ [path]~))
      :: pass local update
      =.  cor  (give-local-update /updates [%record id ship record])
      :: give the guest the record
      (~(publish re ship) record)
    --
  --
--
