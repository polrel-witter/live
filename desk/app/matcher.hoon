::  %matcher: %live's social networking agent
::
/-  *matcher, live, live-peers, contacts
/+  *sss, *mip, verb, dbug, default-agent
::
|%
::
+$  versioned-state  $%(state-0)
::
+$  state-0
  $:  %0
      profiles=(mip ship term entry)                   :: contact info
      peers=(mip id:live ship [stage status])          :: our relation to a peer
      matches=(mip id:live ship (list ship))           :: matched peers
      reaches=(mip id:live ship (list ship))           :: match attempts
      sub-peers=_(mk-subs live-peers ,[%peers @ @ ~])  :: subscriptions
      pub-peers=_(mk-pubs live-peers ,[%peers @ @ ~])  :: publications
  ==
::
+$  card  card:agent:gall
::
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
      cor  ~(. +> [bowl ~])
  ::
  ++  on-init
    ^-  (quip card _this)
    =^  cards  state  abet:init:cor
    [cards this]
  ::
  ++  on-save
    ^-  vase
    !>(state)
  ::
  ++  on-load
    |=  =vase
    ^-  (quip card _this)
    =^  cards  state  abet:(load:cor vase)
    [cards this]
  ::
  ++  on-poke
    |=  =cage
    ^-  (quip card _this)
    =^  cards  state  abet:(poke:cor cage)
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
    `this
  ::
  ++  on-fail   on-fail:def
  ++  on-leave  on-leave:def
  --
|_  [=bowl:gall dek=(list card)]
+*  cor  .
    du-peers    =/  du  (du live-peers ,[%peers @ @ ~])
                  (du pub-peers bowl -:!>(*result:du))
    da-peers    =/  da  (da live-peers ,[%peers @ @ ~])
                  %:  da
                    sub-peers
                    bowl
                    -:!>(*result:da)
                    -:!>(*from:da)
                    -:!>(*fail:da)
                  ==
::
++  emit  |=(=card cor(dek [card dek]))
++  emil  |=(lac=(list card) cor(dek (welp lac dek)))
++  abet  ^-((quip card _state) [(flop dek) state])
::  +sss-pub-peers: update +cor cards and pub-peers state
::
::   sss library produces a (quip card _pubs) so we need to split it
::   to write to +cor state
::
++  sss-pub-peers
  |=  [c=(list card) p=_pub-peers]
  ^+  cor
  =.  pub-peers  p
  (emil c)
::  +sss-sub-peers: update +cor cards and sub-peers state
::
++  sss-sub-peers
  |=  [c=(list card) s=_sub-peers]
  ^+  cor
  =.  sub-peers  s
  (emil c)
::
++  init
  ^+  cor
  ::  populate our profile with default fields and subscribe to our Tlon
  ::  profile data
  ::
  =.  profiles  set-default-fields
  =.  cor  (emit (make-watch /profile/local our.bowl %contacts /contact))
  scry-tlon-fields
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
      [~ %sss %on-rock @ @ @ %peers @ @ ~]
    =.  sub-peers
      (chit:da-peers |3:wire sign)
    cor
  ::
      [~ %sss %scry-request @ @ @ %peers @ @ ~]
    (sss-sub-peers (tell:da-peers |3:wire sign))
  ::
      [~ %sss %scry-response @ @ @ %peers @ @ ~]
    (sss-pub-peers (tell:du-peers |3:wire sign))
  ::
     [%profile *]
    ?+    t.wire  ~|(bad-agent-wire+wire !!)
        [%local ~]
      :: TODO handle these properly
      ?-    -.sign
          %kick  !!
          %poke-ack  !!
          %watch-ack
        ?~  p.sign
          ~&(> "watching %contacts for updates to our Tlon profile" cor)
        :: TODO handle the $tang properly
        ~&(u.p.sign cor)
      ::
          %fact
        =/  =update:contacts  !<(update:contacts q.cage.sign)
        =.(cor (update-tlon-fields ?~(con.update ~ `con.update)) cor)
      ==
    ==
  ==
::
++  arvo
  |=  [=wire =sign-arvo]
  ^+  cor
  ?+    wire  ~|(bad-arvo-wire+wire !!)
      [%eyre %connect ~]
    ?.  ?=([%eyre %bound *] sign-arvo)
      ~|(unexpected-system-response+sign-arvo !!)
    ~?  !accepted.sign-arvo
      [dap.bowl 'eyre bind rejected!' binding.sign-arvo]
    cor
  ==
::
++  poke
  |=  [=mark =vase]
  ^+  cor
  ?+    mark  ~|(bad-poke+mark !!)
      %matcher-deed
    =+  !<(=deed vase)
    ?-  -.deed
      %edit-profile  (edit-profile +.deed)
      %shake         (~(shake pe id.deed ship.deed) status.deed)
    ==
  ::
      %matcher-dictum
    =+  !<(d=dictum vase)
    ::  only a host can pass a $dictum
    ::
    ?.  |(=(ship.id.d our.bowl) =(ship.id.d src.bowl))
      ~&(>>> "only the host of {<name.id.d>} can pass a dictum" cor)
    ?-  -.+.d
        %subscribe    (subscribe id.d)
        %add-peer     ?:((event-exists id.d) ~(add pe id.d ship.d) cor)
        %delete-peer  ?:((event-exists id.d) ~(delete pe id.d ship.d) cor)
        %show
      ?:((event-exists id.d) (~(show pe id.d ship.d) status.d) cor)
    ==
  ::
      %sss-to-pub
    =/  msg  !<(into:du-peers (fled vase))
    (sss-pub-peers (apply:du-peers msg))
  ::
      %sss-live-peers
    =/  msg  !<(into:da-peers (fled vase))
    (sss-sub-peers (apply:da-peers msg))
  ::
      %sss-fake-on-rock
    =/  msg  !<(from:da-peers (fled vase))
    ?>  ?=([[%peers @ @ ~] *] msg)
    (emil (handle-fake-on-rock:da-peers msg))
  ::
      %sss-on-rock
    =/  msg  !<(from:da-peers (fled vase))
    ?>  ?=([[%peers @ @ ~] *] msg)
    =/  =id:live
      [`ship`+<:path.msg `term`+>-:path.msg]
    ~&  wave.msg
    ?^  wave.msg
      =/  =wave:live-peers  (need wave.msg)
      ::  guest list update so we write to our peers mip
      ::
      ?-    -.wave
          %add-peer     cor(peers (~(put bi peers) id ship.wave ~ ~))
          %delete-peer
        ::  if we're removed, we're no longer %registered/%attended so
        ::  we delete the peers for that event and unsubscribe
        ::
        ?.  =(ship.wave our.bowl)
          cor(peers (~(del bi peers) id ship.wave))
      :: TODO problem with unsubscribing at this point; we get mixed
      :: results when it comes to state changes from the host. Thinking
      :: we should run a check on our local peers state and if null just
      :: write the rock to state and nothing more
      ::
      ::  =.  sub-peers  %^  quit:da-peers  ship.id
      ::                   dap.bowl
      ::                 [%peers ship.id name.id ~]
        cor(peers (~(del by peers) id))
      ==
    ::  we've been added to some new event so we add the guests to our peers mip
    ::
    =/  new-peers=(list ship)
      ~(tap in guests.rock.msg)
    |-
    ?~  new-peers  cor
    =?  peers  ?!(=(our.bowl i.new-peers))
      (~(put bi peers) id i.new-peers ~ ~)
    $(new-peers t.new-peers)
  ==
::  +make-act: build poke card
::
++  make-act
  |=  [=wire who=ship app=term =cage]
  ^-  card
  [%pass wire %agent [who app] %poke cage]
::  +make-watch: build watch card
::
++  make-watch
  |=  [=wire who=ship app=term =path]
  ^-  card
  [%pass wire %agent [who app] %watch path]
::  +base-path: prepend to local scries
::
++  base-path
  |=  =dude:gall
  ^-  path
  /(scot %p our.bowl)/(scot %tas dude)/(scot %da now.bowl)
::  +event-exists: check if an event exists in our %live state
::
++  event-exists
  |=  =id:live
  ^-  ?
  =/  =demand:live
    .^  demand:live
      %gu
      %+  weld  (base-path %live)
      /event/exists/(scot %p ship.id)/(scot %tas name.id)
    ==
  ?.  ?=(%event-exists -.demand)
    ~|('bad-scry-result' !!)
  ?:  p.demand  &
  ~&(>>> "%live does not have {<id>} in state" |)
::  +record-status: scry for the $status:live of a guest
::
++  record-status
  |=  [=id:live guest=ship]
  ^-  (unit status:live)
  =;  =demand:live
   ?.  ?=(%record -.demand)
     ~|('bad-scry-result' !!)
   ?~  p.demand
     ~&(>>> "{<guest>} does not have a record at event {<id>}" ~)
   `status.u.p.demand
 .^  demand:live
   %gx
   %+  weld  (base-path %live)
   /record/(scot %p ship.id)/(scot %tas name.id)/(scot %p guest)/live-demand
 ==
::  +edit-profile: add/update a profile field entry
::
++  edit-profile
  |=  [field-id=term update=entry]
  ^+  cor
  ?.  =(our.bowl src.bowl)  cor
  ?.  (~(has bi profiles) our.bowl field-id)
    ~&(>>> "profile field, {<field-id>}, not supported" cor)
  :: TODO support editing Tlon fields from %matcher
  ::
  ?:  ?=(?(%nickname %bio %avatar) field-id)
    ~&(>>> "cannot edit Tlon field, {<field-id>}, from %matcher" cor)
  cor(profiles (~(put bi profiles) our.bowl field-id update))
::  +subscribe: a poke received from a host, asking us to subscribe to
::  their sss %peers path for guest list updates
::
++  subscribe
  |=  =id:live
  ^+  cor
  ::  must come from event host
  ::
  ?.  =(ship.id src.bowl)  cor
  ::  we cannot be the host
  ::
  ?:  =(ship.id our.bowl)
    ~&(>>> "cannot subscribe to a guest list of which we're the host" cor)
  %-  sss-sub-peers
  (surf:da-peers src.bowl dap.bowl [%peers ship.id name.id ~])
::  +scry-tlon-fields: populate Tlon profile via scry
::
++  scry-tlon-fields
  ^+  cor
  =;  rol=rolodex:contacts
    =/  f=(unit foreign:contacts)
      (~(get by rol) our.bowl)
    ?~  f  cor
    ?~  for.u.f  cor
    ?~  con.for.u.f  cor
    (update-tlon-fields `con.for.u.f)
  =/  is-running=?
    .^(? %gu (weld (base-path %contacts) /$))
  ?.  is-running
    ~&(>> "%contacts isn't running, cannot pull our Tlon profile data" ~)
  .^(rolodex:contacts %gx (weld (base-path %contacts) /all/contact-rolodex))
::  +update-tlon-fields: populate supported Tlon fields into %live profile
::
++  update-tlon-fields
  |=  con=(unit contact:contacts)
  ^+  cor
  =/  ls=(list f=[term entry])
    ?~  con
      ~[[%nickname ~] [%bio ~] [%avatar ~]]
    ~[[%nickname `nickname.u.con] [%bio `bio.u.con] [%avatar avatar.u.con]]
  |-
  ?~  ls  cor
  =.  profiles
    (~(put bi profiles) our.bowl f.i.ls)
  $(ls t.ls)
::  +set-default-fields: create default profile fields
::
++  set-default-fields
  ^+  profiles
  =;  ms=(map term entry)
    (~(put by *(mip ship term entry)) our.bowl ms)
  %-  malt
  %+  turn
    ^-  (list term)
    :~  %nickname
        %avatar
        %bio
        %ens-domain
        %telegram
        %github
        %signal
        %x
        %email
        %phone
    ==
  |=  =term
  [term ~]
::
::
++  pe
  |_  [=id:live culp=ship]
  +*  path  [%peers ship.id name.id ~]
  ::  +init-sss-peers: set the sss peers path, which is is only accessed
  ::  by ships within the peers mip
  ::
  ++  init-sss-peers
    ^+  cor
    (sss-pub-peers (secret:du-peers [path]~))
  ::  +allow-sss: give culp access to the sss peers path
  ::
  ++  allow-sss-peers
    ^+  cor
    (sss-pub-peers (allow:du-peers [culp]~ [path]~))
  ::  +block-sss-peers: revoke sss peers path access
  ::
  ++  block-sss-peers
    ^+  cor
    (sss-pub-peers (block:du-peers ~[culp] [path]~))
  ::  +publish: push an sss update to our peers
  ::
  ++  publish
    |=  =wave:live-peers
    ^+  cor
    %-  sss-pub-peers
    (give:du-peers path wave)
  ::  +add: put a new guest in our peers mip
  ::
  ++  add
    ^+  cor
    ?:  (~(has bi peers) id culp)
      ~&(> "{<culp>} is already a peer" cor)
    =/  who=(unit ship)
      ::  only add to peers if they're %registered or %attended, or if
      ::  the culp is the host (i.e. us)
      ::
      ?:  =(our.bowl culp)  `culp
      =/  sta=(unit status:live)
        (record-status id culp)
      ?~  sta  ~
      ?.(?=(?(%registered %attended) p.u.sta) ~ `culp)
    ?~  who  cor
    =.  peers
      (~(put bi peers) id u.who ~ ~)
    ~&  >  "added {<u.who>} to peers"
    ::  if we're being added, i.e. which means we're the host, then init
    ::  the sss peers path and publish an update
    ::
    ::  otherwise give the culp access to the sss peers path, ask them
    ::  to subscribe to it, and publish an update
    ::
    =?  cor  =(our.bowl u.who)
      init-sss-peers
    ?:  =(our.bowl u.who)
      (publish [%add-peer u.who])
    =.  cor  allow-sss-peers
    =/  =cage
      matcher-dictum+!>(`dictum`[id [%subscribe ~]])
    =.  cor
      (emit (make-act /subscribe/(scot %p u.who) u.who dap.bowl cage))
    (publish [%add-peer u.who])
  ::  +delete: remove a guest from our peers mip
  ::
  ++  delete
    ^+  cor
    ?.  (~(has bi peers) id culp)
      ~&(> "{<culp>} has already been removed from peers state" cor)
    =/  sta=(unit status:live)
      (record-status id culp)
    ?~  sta  cor
    ::  delete from peers as long as they're not %registered or
    ::  %attended
    ::
    ?:  ?=(?(%registered %attended) p.u.sta)
      cor
    =.  peers
      (~(del bi peers) id culp)
    ~&  >  "removed {<culp>} from peers"
    =.  cor  block-sss-peers
    (publish [%delete-peer culp])
  ::
  ++  show
    |=  =status
    !!
  ::
  ++  shake
    |=  =status
    :: ?.  =(our.bowl src.bowl)  cor
    !!
  --
--
