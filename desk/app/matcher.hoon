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
  =.  cor  scry-tlon-fields
  %-  emit
  [%pass /eyre/connect %arvo %e %connect [~ /apps/live] %matcher]
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
    ?.  =(src.bowl our.bowl)  cor
    ?-  -.deed
      %edit-profile  (edit-profile +.deed)
      %shake         (~(shake pe id.deed ship.deed) status.deed)
    ==
  ::
      %matcher-dictum
    =+  !<(dict=dictum vase)
    ?.  =(src.bowl our.bowl)  cor
    ::  make sure we're the host
    ::
    ?.  =(ship.id.dict our.bowl)
      ~&(>>> "only the host of {<name.id.dict>} can pass a dictum" cor)
    ::  make sure the event exists in %live
    ::
    =/  =demand:live
      .^  demand:live
        %gu
        %+  weld  (base-path %live)
        /event/exists/(scot %p ship.id.dict)/(scot %tas name.id.dict)
      ==
    ?.  ?=(%event-exists -.demand)
      ~|('bad-scry-result' !!)
    ?.  p.demand
      ~&(>>> "event name, {<name.id.dict>}, not found in %live" cor)
    ?-  -.+.dict
      %add-peer     ~(add pe id.dict ship.dict)
      %delete-peer  ~(delete pe id.dict ship.dict)
      %show         (~(show pe id.dict ship.dict) status.dict)
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
    :: TODO this is where sub updates come in
    |^
    =/  msg  !<(from:da-peers (fled vase))
    ?>  ?=([[%peers @ @ ~] *] msg)
    ?>  =(our.bowl `ship`+>-:path.msg)
    cor
    --
  ==
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
::  +guest-exists: %live guest record existence check
::
++  guest-exists
  |=  [=id:live guest=ship]
  ^-  ?
  =;  =demand:live
    ?.  ?=(%record-exists -.demand)
      ~|('bad-scry-result' !!)
    ?:  p.demand  &
    ~&(>>> "{<guest>} is not a guest of {<name.id>}" |)
  .^  demand:live
    %gu
    %+  weld  (base-path %live)
    /record/exists/(scot %p ship.id)/(scot %tas name.id)/(scot %p guest)
  ==
::  +edit-profile: add/update a profile field entry
::
++  edit-profile
  |=  [field-id=term update=entry]
  ^+  cor
  ?.  (~(has bi profiles) our.bowl field-id)
    ~&(>>> "profile field, {<field-id>}, not supported" cor)
  :: TODO support editing Tlon fields from %matcher
  ::
  ?:  ?=(?(%nickname %bio %avatar) field-id)
    ~&(>>> "cannot edit Tlon field, {<field-id>}, from %matcher" cor)
  cor(profiles (~(put bi profiles) our.bowl field-id update))
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
++  pe
  |_  [=id:live culp=ship]
  ::
  ++  add
    ^+  cor
::    ?.  guest-exists  cor
    =.  peers
      (~(put bi peers) id culp ~ ~)
    =+  path=[%peers ship.id name.id ~]
    %-  sss-pub-peers
    (give:du-peers path [%add-peer culp])
  ::
  ++  delete  !!
  ::
  ++  show
    |=  =status
    !!
  ::
  ++  shake
    |=  =status
    !!
  --
--
