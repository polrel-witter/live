::  %matcher: %live's social networking agent
::
/-  *matcher, live, live-matches, contacts
/+  *sss, *mip, verb, dbug, default-agent
::
|%
::
+$  versioned-state  $%(state-0)
::
+$  state-0
  $:  %0
      profiles=(mip ship term entry)                  :: contact info
      subs=_(mk-subs live-matches ,[%matches @ @ ~])  :: subscriptions
      pubs=_(mk-pubs live-matches ,[%matches @ @ ~])  :: publications
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
    du-matches    =/  du  (du live-matches ,[%matches @ @ ~])
                  (du pubs bowl -:!>(*result:du))
    da-matches    =/  da  (da live-matches ,[%matches @ @ ~])
                  (da subs bowl -:!>(*result:da) -:!>(*from:da) -:!>(*fail:da))
::
++  emit  |=(=card cor(dek [card dek]))
++  emil  |=(lac=(list card) cor(dek (welp lac dek)))
++  abet  ^-((quip card _state) [(flop dek) state])
::  +sss-pubs: update +cor cards and pubs state
::
::   sss library produces a (quip card _pubs) so we need to split it
::   to write to +cor state
::
++  sss-pubs
  |=  [c=(list card) p=_pubs]
  ^+  cor
  =.  pubs  p
  (emil c)
::  +sss-subs: update +cor cards and subs state
::
++  sss-subs
  |=  [c=(list card) s=_subs]
  ^+  cor
  =.  subs  s
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
      [~ %sss %on-rock @ @ @ %matches @ @ ~]
    =.  subs
      (chit:da-matches |3:wire sign)
    cor
  ::
      [~ %sss %scry-request @ @ @ %matches @ @ ~]
    (sss-subs (tell:da-matches |3:wire sign))
  ::
      [~ %sss %scry-response @ @ @ %matches @ @ ~]
    (sss-pubs (tell:du-matches |3:wire sign))
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
      %matcher-action
    =/  act  !<(action vase)
    ?.  =(src.bowl our.bowl)  cor
    ?-    -.act
        %edit-profile  (edit-profile p.act q.act)
    ==
      %sss-to-pub
    =/  msg  !<(into:du-matches (fled vase))
    (sss-pubs (apply:du-matches msg))
  ::
      %sss-subs
    =/  msg  !<(into:da-matches (fled vase))
    (sss-subs (apply:da-matches msg))
  ::
      %sss-fake-on-rock
    =/  msg  !<(from:da-matches (fled vase))
    ?>  ?=([[%matches @ @ ~] *] msg)
    (emil (handle-fake-on-rock:da-matches msg))
  ::
      %sss-on-rock
    :: TODO this is where sub updates come in
    |^
    =/  msg  !<(from:da-matches (fled vase))
    ?>  ?=([[%matches @ @ ~] *] msg)
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
::  +edit-profile: add/update a profile field entry
::
++  edit-profile
  |=  [field-id=term update=entry]
  ^+  cor
  ?.  (~(has bi profiles) our.bowl field-id)
    ~&(>>> "profile field, {<field-id>}, not supported" cor)
  cor(profiles (~(put bi profiles) our.bowl field-id update))
::  +scry-tlon-fields: populate Tlon profile via scry
::
++  scry-tlon-fields
  ^+  cor
  =;  con=(unit contact:contacts)
    ?~  con  cor
    (update-tlon-fields con)
  =/  base-path=path
    /(scot %p our.bowl)/contacts/(scot %da now.bowl)
  =/  is-running=?
    .^(? %gu (weld base-path /$))
  ?.  is-running
    ~&(>> "%contacts isn't running, cannot pull our Tlon profile data" ~)
  %-  some
  .^  contact:contacts
    %gx
    (weld base-path /contact/(scot %p our.bowl)/contact)
  ==
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
--
