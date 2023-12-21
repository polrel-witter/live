::  live-view: %live's frontend
::
/-  *live, live-records
/+  *mip, icon=live-icons, live-help
::
|_  $:  =bowl:gall
        events=(map id event)
        records=(mip id ship record)
        result=$@(@t (map id info))
    ==
::
++  page
  |=  heart=marl
  ^-  manx
  ;html
    ;head
      ;title:"%live"
      ;meta(charset "utf-8");
      ;meta(name "viewport", content "width=device-width, initial-scale=1");
      ;script:"htmx.logAll();"
      ;script
        =src          "https://unpkg.com/htmx.org@1.9.5"
        =integrity    "sha384-xcuj3WpfgjlKF+FXhSQFQ0ZNr39ln+hwjN3npfM9VBnUskLolQAcN80McRIVOPuO"
        =crossorigin  "anonymous";
      ;style: {style}
    ==
    ;body#whole(hx-boost "true")
      ;*  heart
    ==
  ==
::  +help: user help page
::
++  help
  ^-  manx
  %-  page
  ;=  ;nav
        ;+  (page-button "home" (make-path %active ~))
      ==
      ;+  guide:live-help
  ==
::  +active: active event metadata displayed in a timeline; also our
::  home page
::
++  active
  ^-  manx
  %-  page
  =/  timeline=marl
    (render-timeline %active ~)
  ;=  ;nav
        ;+  (page-button "find" (make-path %find ~))
        ;+  (page-button "create" (make-path %create ~))
        ;+  ?~  (render-timeline %over ~)
              ;/  ""
            (page-button "archive" (make-path %archive ~))
        ;+  (reload-button (make-path %active ~))
      ==
      ;div.timeline
        ;+  ?~  timeline
              ;h3.center
                No active events; find or create your own above
              ==
            ;ul
              ;*  timeline
            ==
      ==
      ;+  footer
  ==
::  +archive: events that are %over, displayed in a timeline
::
++  archive
  ^-  manx
  %-  page
  ;=  ;nav
        ;+  (page-button "find" (make-path %find ~))
        ;+  (page-button "create" (make-path %create ~))
        ;+  (page-button "active" /apps/live)
        ;+  (reload-button (make-path %archive ~))
      ==
      ;div.timeline.over
        ;ul
          ;*  (render-timeline %over ~)
        ==
      ==
      ;+  footer
  ==
::  +find: search page; renders a list of discoverable events found
::  under a ship
::
++  find
  ^-  manx
  %-  page
  =/  begin=marl
    ;=  ;div
          ;h3.center: Enter a ship or event link above
    ==  ==
  ;=  ;div#results
        ;nav
          ;+  (page-button "home" /apps/live)
          ;form.nav-input
            =hx-target    "#results"
            =hx-swap      "outerHTML"
            =hx-post      (spud (make-path %dial ~))
            ;input(type "hidden", name "head", value "find");
            ;input
              =name         "ship-name"
              =placeholder  "~hoster or ~hoster/event-name";
            ;+  ;/  " "
            ;button(type "submit"): find
          ==
        ==
        :: initial page load shows results of previous search, if retreived
        ;div
          ;*  ?~  result  begin
              ?@  result  begin
              ;+  ;div.timeline
                    ;p: previous search:
                    ;ul
                      ;*  (render-timeline %active ;;((map id info) result))
                    ==
                  ==
        ==
      ==
  ==
::  +results: populate events initiated from a %find; embedded in the
::  +find page
::
++  results
  ^-  manx
  ?~  result
    ;div
      =hx-trigger  "every 1s"
      =hx-get      (spud (make-path %results ~))
      =hx-target   "this"
      =hx-swap     "outerHTML"
      ;nav
        ;+  (page-button "cancel" (make-path %find ~))
      ==
      ;h3.center:  searching ...
    ==
  ?^  result
    ;div.timeline
      ;nav
        ;+  (page-button "new search" (make-path %find ~))
      ==
      ;ul
        ;*  (render-timeline %active ;;((map id info) result))
      ==
    ==
  ;div
    ;nav
      ;+  (page-button "new search" (make-path %find ~))
    ==
    ;h3.center
      ;+  ;/  (trip result)
    ==
  ==
::  +contact: polling mechanism for when a guest requests a status
::  change (i.e. sends a %register or %unregister poke to the host)
::  and must wait for a response
::
++  contact
  |_  =id
  ::
  ++  reg
    ^-  manx
    ?~  record=(~(get bi records) id our.bowl)
      (~(poll contact id) %register)
    ?:  ?=(?(%registered %requested) p.status.u.record)
      ~(stop contact id)
    (~(poll contact id) %register)
  ::
  ++  unreg
    ^-  manx
    ?~  record=(~(get bi records) id our.bowl)
      (~(poll contact id) %unregister)
    ?:  ?=(%unregistered p.status.u.record)
      ~(stop contact id)
    (~(poll contact id) %unregister)
  ::
  ++  stop
    ^-  manx
    ;div(hx-get (spud (make-path %event `id)), hx-trigger "load");
  ::
  ++  poll
    |=  typ=?(%register %unregister)
    ^-  manx
    ;div
      =hx-trigger  "every 1s"
      =hx-get      (spud (weld (make-path %contact `id) /(scot %tas typ)))
      =hx-target   "this"
      =hx-swap     "outerHTML"
      ;nav
        ;+  (page-button "cancel" (make-path %event `id))
      ==
      ;h3.center:  contacting host ...
    ==
  --
::  +details: event page, rendered based on whether we're the host, a
::  guest, or the event was searched for
::
++  details
  |=  =id
  |^  ^-  manx
  %-  page
  ?:  =(our.bowl ship.id)  (host id)
  ?~  (~(get bi records) id our.bowl)
    (foreign id)
  (record id)
  ::  +foreign: render event details found through search
  ::
  ++  foreign
    |=  =_id
    ^-  marl
    ?@  result  (not-found "event")
    ?~  info=(~(get by ;;((map [ship term] info) result)) id)
      (not-found "event")
    ;=  ;nav
          ;+  (page-button "back" (make-path %find ~))
          ;+  ?:  |(?=(%secret kind.u.info) ?=(%over latch.u.info))
                ;/  ""
              ;form
                =hx-post    (spud (make-path %operation `id))
                =hx-target  "#whole"
                =hx-swap    "outerHTML"
                ;input(type "hidden", name "head", value "register");
                ;input(type "hidden", name "ship", value "");
                ;button
                  ;+  ;/  ?.  ?=(%private kind.u.info)
                            "register"
                          "request enty"
                ==
              ==
          ;+  (reload-button (make-path %event `id))
        ==
        ;div
          ;+  (event-header id u.info)
          ;+  ?~  about.u.info  ;/  ""
              ;div.about
                ;*  (render-text u.about.u.info)
              ==
        ==
    ==
  ::  +record: render our record for a 3rd party event
  ::
  ++  record
    |=  =_id
    ^-  marl
    ?~  record=(~(get bi records) id our.bowl)
      (not-found "record")
    =/  render-status=manx
      ;div.status
        ;code: {<p.status.u.record>}
        ;br;
        ;code: {<q.status.u.record>}
      ==
    =/  act=(unit tape)
      ?-    p.status.u.record
          %attended   ~
          %requested  ~
          %registered  `"unregister"
          ?(%invited %unregistered)  `"register"
      ==
    ;=  ;nav
          ;+  ?.  ?=(%over latch.info.u.record)
                (page-button "home" /apps/live)
              (page-button "home" (make-path %archive ~))
          ;+  ?~  act  ;/  ""
              ;form
                =hx-post    (spud (make-path %operation `id))
                =hx-target  "#whole"
                =hx-swap    "outerHTML"
                ;input(type "hidden", name "head", value u.act);
                ;input(type "hidden", name "ship", value "");
                ;button
                  ;+  ;/  ?:  ?&  ?=(%unregistered p.status.u.record)
                                  ?=(?(%secret %private) kind.info.u.record)
                              ==
                            "request entry"
                          u.act
                ==
              ==
          ;+  (delete-event-button id)
          ;+  (reload-button (make-path %event `id))
        ==
        ;div
          ;+  (event-header id info.u.record)
          ;+  render-status
          ;+  ?~  about.info.u.record  ;/  ""
              ;div.about
                ;*  (render-text u.about.info.u.record)
              ==
          ;+  ?~  secret.u.record  ;/("")
              ;div.white-border
                ;p.center: - - - secret - - -
                ;*  (render-text u.secret.u.record)
              ==
        ==
    ==
  ::  +host: event dashboard for host
  ::
  ++  host
    |=  =_id
    |^  ^-  marl
    ?~  e=(~(get by events) id)
      (not-found "event")
    =/  =event  u.e
    ;=  ;nav
          ;+  (page-button "back" (make-path %manage `id))
          ;+  (delete-event-button id)
          ;+  (reload-button (make-path %event `id))
        ==
        ;div
          ;div.white-border
            ;div.title(hx-target "this", hx-swap "outerHTML")
              ;+  ;/  (trip title.info.event)
              ;+  (edit-button id %title ~)
            ==
          ::
            ;div
              ;code: hosted by {<ship.id>}
            ==
          ::
            ;div.moment(hx-target "this", hx-swap "outerHTML")
              ;+  (render-moment moment.info.event)
              ;+  (edit-button id %moment ~)
            ==
          ::
            ;div.horizontal(hx-target "this", hx-swap "outerHTML")
              ;code.tip(title (latch-tip latch.info.event)): {<latch.info.event>}
              ;+  (edit-button id %latch ~)
              ;+  ;/  " | "
            ==
          ::
            ;div.horizontal(hx-target "this", hx-swap "outerHTML")
              ;code.tip(title (kind-tip kind.info.event)): {<kind.info.event>}
              ;+  (edit-button id %kind ~)
            ==
          ::
            ;div(hx-target "this", hx-swap "outerHTML")
              ;+  ;/  %+  weld
                        "registration limit: "
                      ?~(limit.event "∞" "{<u.limit.event>}")
              ;+  (edit-button id %limit ~)
            ==
          ==
        ::
          ;+  ?~  about.info.event
                ;div.align-right(hx-target "this", hx-swap "outerHTML")
                  ;+  (edit-button id %about `'add description')
                ==
              ;div.about(hx-target "this", hx-swap "outerHTML")
                ;*  (render-text u.about.info.event)
                ;+  (edit-button id %about ~)
              ==
        ::
          ;div
            =hx-target  "this"
            =hx-swap    "outerHTML"
            =title      "this message is only sent to registrants"
            ;+  ?~  secret.event
                  ;div.align-right
                    ;+  (edit-button id %secret `'add secret')
                  ==
                ;div.white-border
                  ;p.tip.center: - - - secret - - -
                  ;*  (render-text u.secret.event)
                  ;+  (edit-button id %secret ~)
                ==
          ==
        ==
    ==
    ::  +edit-button: button that swaps out rendered state with its
    ::  corresponding edit element
    ::
    ++  edit-button
      |=  [=_id =get-fleck label=(unit @t)]
      ^-  manx
      =/  =info
        info:(~(got by events) id)
      :: don't produce a button for an %over event, barring %latch
      ?:  ?&  ?=(%over latch.info)
              ?!(?=(%latch get-fleck))
          ==
        ;/  ""
      ;button(hx-get (spud (make-path get-fleck `id)))
        ;+  ?~  label
              edit:icon
            ;/  (trip u.label)
      ==
    --
  ::  +event-header: render some event metadata
  ::
  ++  event-header
    |=  [=_id =info]
    ^-  manx
    ;div.white-border
      ;div.title
        ;+  ;/  (trip title.info)
      ==
      ;div
        ;code: hosted by {<ship.id>}
      ==
      ;div.moment
        ;+  (render-moment moment.info)
      ==
      ;+  (render-latch-and-kind latch.info kind.info)
      ;div.align-right
        ;button
          =hx-get  (spud (make-path %event-link `id))
          =hx-swap  "outerHTML"
          show event link
        ==
      ==
    ==
  --
::  +create: event creation page
::
++  create
  ^-  manx
  %-  page
  ;=  ;nav
        ;+  (page-button "cancel" /apps/live)
      ==
      ;form.create
        =method  "post"
        =action  (spud /apps/live/operation/(scot %p our.bowl)/$)
        ;input(type "hidden", name "head", value "create");
        ;input(type "hidden", name "latch", value "closed");
        ;input.title(name "title", placeholder "Title", required "");
        ;div
          ;p: start:
          ;input.moment(type "datetime-local", name "moment-start");
          ;p: end:
          ;input.moment(type "datetime-local", name "moment-end");
          ;p: GMT zone:
          ;select(name "timezone")
            ;*  generate-zones
          ==
        ==
        ;div
          ;p: registration limit:
          ;input(type "number", name "limit", min "0");
        ==
        ;textarea
          =name         "about"
          =placeholder  "Description..."
          =rows         "10";
        ;textarea
          =name         "secret"
          =placeholder  "Secret; a message sent to registered guests..."
          =rows         "10";
        ;div
          ;+  kind-select
        ==
        ;div
          ;select(name "latch")
            ;option(name "open"): open
            ;option(name "closed"): closed
          ==
        ==
        ;button(type "submit"): create
      ==
  ==
::  +manage: records management page
::
++  manage
  |=  =id
  |^  ^-  manx
  %-  page
  ?~  (~(get by events) id)
    (not-found "event")
  =/  =event  (~(got by events) id)
  ;=  ;nav
        ;+  ?.  ?=(%over latch.info.event)
              (page-button "home" /apps/live)
            (page-button "home" (make-path %archive ~))
        ::
        ;+  (page-button "edit" (make-path %event `id))
        :: cannot invite ships if event is %over
        ;+  ?:  ?=(%over latch.info.event)
              ;/  ""
            ;form.nav-input
              =method  "post"
              =action  (spud (make-path %operation `id))
              ;input(type "hidden", name "head", value "invite");
              ;input
                =name         "ship"
                =placeholder  "~sampel-palnet"
                =required     "";
              ;+  ;/  " "
              ;button(type "submit"): invite
            ==
      ==
      ;div.content
        ;div.reload
          ;+  (reload-button (make-path %manage `id))
        ==
        ;div.white-border
          ;div.title
            ;+  ;/  (trip title.info.event)
          ==
          ::
          ;+  (render-latch-and-kind latch.info.event kind.info.event)
          ::
          ;div
            ;+  ;/  (weld "registered: " ~(registered count id))
            ;br;
            ;+  ;/  (weld "requesting entry: " ~(requested count id))
            ;br;
            ;+  ;/  (weld "invited: " ~(invited count id))
            ;br;
            ;+  ;/  (weld "attended: " ~(attended count id))
            ;br;
            ;+  ;/  (weld "unregistered: " ~(unregistered count id))
          ==
          ;div.align-right
            ;button
              =hx-get  (spud (make-path %event-link `id))
              =hx-swap  "outerHTML"
              show event link
            ==
          ==
        ==
        ;div.records
          ;*  ?.  (is-empty id)  ~(build tb id)
              ;+  ;div
                    ;h3.center
                      ;+  ;/  ?:  ?=(%over latch.info.event)
                                "No records"
                              %+  weld
                                "No records; invite ships above"
                              ?:  ?=(%secret kind.info.event)  ~
                              " or share your event link so others can find it"
                    ==
                  ==
        ==
      ==
  ==
  ::  +is-empty: check if we have any records for our event
  ::
  ++  is-empty
    |=  =_id
    ^-  ?
    ?~((~(key bi records) id) & |)
  ::  +tb: make a series of tables organized by $status
  ::
  ++  tb
    |_  =_id
    +*  event  (~(got by events) id)
    ::
    ++  build
      |^  ^-  marl
      =;  guests=(list (list [ship status]))
        ;*  (turn guests ~(make-table tb id))
      =/  ships=(list ship)
        ~(tap in (~(key bi records) id))
      %-  order-by-status
      %+  murn  ships
      |=  who=ship
      =+  (~(get bi records) id who)
      ?~(- ~ `[who status.u.-])
      ::  +order-by-status: arrange a list of ships and their statuses by
      ::  status type
      ::
      ++  order-by-status
        |=  guests=(list [ship status])
        ^-  (list (list [ship status]))
        =|  out=(list (list [ship status]))
        =/  pins=(list _-:status)
          :~  %unregistered
              %attended
              %invited
              %requested
              %registered
          ==
        |-
        ?~  pins  out
        =;  group=(list [ship status])
          =.  group  (sort group alp)
          $(out ?~(group out [group out]), pins t.pins)
        %+  murn  guests
        |=  [=ship =status]
        ?.  =(p.status i.pins)  ~
        `[ship status]
      ::  +alp: order ships alphabetical
      ::
      ++  alp
        |=  [[a=ship *] [b=ship *]]
        (aor (scot %p a) (scot %p b))
      --
    ::  +make-table: build a table organized by status type
    ::
    ++  make-table
      |=  guests=(list [ship =status])
      ^-  manx
      =;  content=marl
        ;div.status-section
          ;*  content
        ==
      ?~  guests
        ;+  ;h3.center: No records
      ;=
        ;h2
          ;+  ;/  (scow %tas p.status.i.guests)
        ==
        ;table
          ;tbody
            ;*  (~(make-rows tb id) guests)
          ==
        ==
      ==
    ::  +make-rows: slot in guest details
    ::
    ++  make-rows
      |=  guests=(list [ship status])
      ^-  marl
      ;*  %+  turn  guests
          |=  [=ship =status]
          ^-  manx
          ;tr
            ;td
              ;div.record-entry
                ;code: {<ship>}
                ;br;
                ;code: {<p.status>}
                ;br;
                ;code: {<q.status>}
              ==
            ==
            :: don't add controls if event is %over
            ;+  ?:  ?=(%over latch.info.event)  ;/  ""
                ;td
                  ;+  (~(make-controls tb id) ship status)
                ==
          ==
    ::  +make-controls: slot in buttons following current status
    ::
    ++  make-controls
      |=  [=ship =status]
      |^  ^-  manx
      ;div
        ;+  ?-    p.status
                %invited       ;/  ""
                %unregistered  (control-button ship "invite" ~)
                %attended      (control-button ship "punch" "revoke")
                %requested
              :: if the event limit is reached, don't render
              =;  render=?
                ?.  render  ;/  ""
                (control-button ship "register" ~)
              ?~  limit.event  &
              ?!(=(~(total-permitted count id) (need limit.event)))
            ::
                %registered
              ;div
                ;+  (control-button ship "punch" "verify")
                ;+  (control-button ship "unregister" ~)
              ==
            ==
      ==
      ::  +control-button: create a button to act on a ship
      ::
      ++  control-button
        |=  [=_ship act-1=tape act-2=tape]
        ^-  manx
        ;form(method "post", action (spud (make-path %operation `id)))
          ;input(type "hidden", name "head", value act-1);
          ;input(type "hidden", name "ship", value (scow %p ship));
          ;+  ?.  |(=("revoke" act-2) =("verify" act-2))
                ;button
                  ;+  ;/  act-1
                ==
              ;div
                ;input(type "hidden", name "job", value act-2);
                ;button
                  ;+  ;/  act-2
                ==
              ==
        ==
      --
    --
  --
::  +link: render event link; i.e. id as ~ship/event-name
::
++  link
  |=  =id
  ^-  manx
  ;code(title "event link")
    ;+  ;/  :(weld "{<ship.id>}" "/" (scow %tas name.id))
  ==
::  +edit: elements to change an event
::
++  edit
  |_  =id
  +*  event          (~(got by events) id)
      cancel-button  (page-button "cancel" (make-path %event `id))
  ::
  ++  delete
    ^-  manx
    ;div.center
      ;h3.red: Are you sure you want to delete {<title.info:event>}?
      ;span.center
        ;form(method "post", action (spud (make-path %operation `id)))
          ;input(type "hidden", name "head", value "delete");
          ;button(type "submit"): yes
        ==
        ;form(method "get", action (spud (make-path %event `id)))
          ;button(type "submit"): no
        ==
      ==
    ==
  ::
  ++  title
    ^-  manx
    ;div
      ;form(method "post", action (spud (make-path %operation `id)))
        ;input(type "hidden", name "head", value "info");
        ;input(type "hidden", name "sub", value "title");
        ;input.title(name "title", value (trip title.info.event));
        ;button(type "submit"): save
        ;+  ;/  " "
        ;+  cancel-button
      ==
    ==
  ::
  ++  about
    ^-  manx
    =/  about=tape
      =+  about.info.event
      ?~(- "" (trip u.-))
    ;div
      ;form(method "post", action (spud (make-path %operation `id)))
        ;input(type "hidden", name "head", value "info");
        ;input(type "hidden", name "sub", value "about");
        ;textarea(name "about", rows "10", cols "40")
          ;+  ;/  about
        ==
        ;button(type "submit"): save
        ;+  ;/  " "
        ;+  cancel-button
      ==
    ==
  ::
  ++  moment
    ^-  manx
    =/  current-zone=tape
      =,  timezone.moment.info.event
      (weld ?:(p "+" "-") (scow %ud q))
    ;div
      ;form(method "post", action (spud (make-path %operation `id)))
        ;input(type "hidden", name "head", value "info");
        ;input(type "hidden", name "sub", value "moment");
        ;p: start:
        ;input.moment(type "datetime-local", name "start");
        ;p: end:
        ;input.moment(type "datetime-local", name "end");
        ;p: GMT zone:
        ;select(name "timezone")
          ;option(value current-zone, selected "selected")
            ;+  ;/  current-zone
          ==
          ;*  generate-zones
        ==
        ;br;
        ;button(type "submit"): save
        ;+  ;/  " "
        ;+  cancel-button
      ==
    ==
  ::
  ++  kind
    ^-  manx
    ;div.horizontal
      ;form(method "post", action (spud (make-path %operation `id)))
        ;input(type "hidden", name "head", value "info");
        ;input(type "hidden", name "sub", value "kind");
        ;+  kind-select
        ;button(type "submit"): save
        ;+  ;/  " "
        ;+  cancel-button
      ==
    ==
  ::
  ++  latch
    ^-  manx
    ;div.horizontal
      ;form(method "post", action (spud (make-path %operation `id)))
        ;input(type "hidden", name "head", value "info");
        ;input(type "hidden", name "sub", value "latch");
        ;+  =/  prevent-open=?
              ?.  ?=(?(%closed %over) latch.info.event)  |
              ?~  limit.event  |
              =(~(total-permitted count id) (need limit.event))
            ?.  prevent-open
              latch-select
            ;select.context
              =name   "latch"
              =title  "registration limit is reached; increase it to reopen"
              ;option(name "closed"): closed
              ;option(name "over"): over
            ==
        ;button(type "submit"): save
        ;+  ;/  " "
        ;+  cancel-button
      ==
    ==
  ::
  ++  secret
    ^-  manx
    =/  secret=tape
      =+  secret.event
      ?~(- "" (trip u.-))
    ;div
      ;form(method "post", action (spud (make-path %operation `id)))
        ;input(type "hidden", name "head", value "secret");
        ;textarea(name "txt", rows "10", cols "40")
          ;+  ;/  secret
        ==
        ;button(type "submit"): save
        ;+  ;/  " "
        ;+  cancel-button
      ==
    ==
  ::
  ++  limit
    ^-  manx
    =/  current-limit=tape
      =+  limit.event
      ?~(- "" (scow %ud u.-))
    ;div
      ;form(method "post", action (spud (make-path %operation `id)))
        ;input(type "hidden", name "head", value "limit");
        ;input(type "number", name "num", min "0", value current-limit);
        ;button(type "submit"): save
        ;+  ;/  " "
        ;+  cancel-button
      ==
    ==
  --
::  +footer: render footer
::
++  footer
  ;footer
    ;a.link(href "/apps/live/help", target "_self"): help
  ==
::  +make-path: form an http get/post path
::
++  make-path
  |=  [fleck=?(get-fleck post-fleck) id=(unit id)]
  ^-  path
  =/  pat=path
    /apps/live/(scot %tas fleck)
  ?~  id
    ?.(?=(%active fleck) pat /apps/live)
  (weld pat /(scot %p ship.u.id)/(scot %tas name.u.id))
::  +post-fleck: http post path distinguishers; e.g.
::  /apps/live/<post-fleck>
::
++  post-fleck  $?(%operation %dial)
::  +get-fleck: http get path distinguishers; e.g.
::  /apps/live/<get-fleck>
::
++  get-fleck
  $?  %active
      %archive
      %find
      %results
      %create
      %event
      %manage
      %contact
      %title
      %about
      %moment
      %kind
      %latch
      %secret
      %limit
      %event-link
      %delete
  ==
::  +delete-event-button: render a button to delete an event
::
++  delete-event-button
  |=  =id
  ^-  manx
  ?.  =(~ (~(get by events) id))
    ;form(method "get", action (spud (make-path %delete `id)))
      ;button.red(type "submit"): delete
    ==
  ;form(method "post", action (spud (make-path %operation `id)))
    ;input(type "hidden", name "head", value "delete");
    ;button.red(type "submit"): delete
  ==
::  +reload-button: generate button that reloads a page
::
++  reload-button
  |=  =path
  ^-  manx
  ;div
    ;code.stamp
      ;+  ;/  (slag 23 (scow %da now.bowl))
    ==
    ;
    ;a(href (spud path), target "_self")
      ;button.reload
        ;+  reload:icon
      ==
    ==
  ==
::  +page-button: make a button that loads a new page
::
++  page-button
  |=  [txt=tape =path]
  ^-  manx
  ;a
    =href    (spud path)
    =target  "_self"
    ;button
      ;+  ;/  txt
    ==
  ==
::  +not-found: general error element for some missing data
::
++  not-found
  |=  missing=tape
  ^-  marl
  ;=  ;div
        ;h1
          ;+  ;/  ~['No' ' ' (crip missing) ' ' 'found']
        ==
      ==
      ;nav
        ;+  (page-button "home" /apps/live)
      ==
  ==
::  +generate-zones: build list of timezone options
::
++  generate-zones
  ^-  marl
  =/  plus=(list tape)
    (turn (gulf 0 14) |=(a=@ud "+{<a>}"))
  =/  minus=(list tape)
    (turn (gulf 1 12) |=(a=@ud "-{<a>}"))
  ;*  %+  turn  (weld plus minus)
      |=  =tape
      ;option(value tape)
        ;+  ;/  tape
      ==
::  +latch-tip: tool-tip text for $latch
::
++  latch-tip
  |=  =latch
  ^-  tape
  ?-  latch
    %open    "accepting registrants"
    %closed  "not accepting registrants; host can invite and receive entry requests"
    %over    "inactive, non-discoverable"
  ==
::  +kind-tip: tool-tip text for $kind
::
++  kind-tip
  |=  =kind
  ^-  tape
  ?-  kind
    %public   "open to anyone; discoverable"
    %private  "approval and invite-only; discoverable"
    %secret   "invite-only; non-discoverable"
  ==
::  +latch-select: selectors to change an event's $latch
::
++  latch-select
  ^-  manx
  ;select(name "latch")
    ;option(name "open"): open
    ;option(name "closed"): closed
    ;option(name "over"): over
  ==
::  +kind-select: selectors to change an event's $kind
::
++  kind-select
  ^-  manx
  ;select(name "kind")
    ;option(name "public"): public
    ;option(name "private"): private
    ;option(name "secret"): secret
  ==
::  +render-latch-and-kind: make div with $latch and $kind together
::
++  render-latch-and-kind
  |=  [=latch =kind]
  ^-  manx
  ;div
    ;code.tip(title (latch-tip latch)): {<latch>}
    ;+  ;/  "  |  "
    ;code.tip(title (kind-tip kind)): {<kind>}
  ==
::  +count: record status quantities
::
++  count
  |_  =id
  ::
  ++  invited       "{<(sum %invited)>}"
  ++  requested     "{<(sum %requested)>}"
  ++  unregistered  "{<(sum %unregistered)>}"
  ++  attended      "{<(sum %attended)>}"
  ++  registered
    =/  =limit
      limit:(~(got by events) id)
    %+  weld  "{<total-permitted>} / "
    ?~(limit "∞" "{<u.limit>}")
  ++  total-permitted
    ^-  @ud
    (add (~(sum count id) %registered) (~(sum count id) %attended))
  ::
  ++  sum
    |=  chk=_-:status
    ^-  @ud
    ?~  rcds=(~(get by records) id)  0
    %-  lent
    %+  murn  ~(tap by u.rcds)
    |=([* r=record] ?:(=(chk p.status.r) `- ~))
  --
::  +render-text: format paragraphs
::
++  render-text
  |=  text=@t
  |^  ^-  marl
  ;*  %+  turn  (make-lines text)
      |=  line=@t
      ;div
        ; {(trip line)}
      ==
  ::  +make-lines: convert a cord to lines of text
  ::
  ++  make-lines
    |=  text=@t
    ^-  tape
    =/  txt  (trip text)
    =|  line=tape
    |-
    ?~  txt
      ?~  line  ~
      [(crip (flop line)) ~]
    ?:  =('\0a' i.txt)
      :-  (crip (flop line))
      $(line "", txt t.txt)
    $(line [i.txt line], txt t.txt)
  --
::  +render-moment: format an event's date and time
::
++  render-moment
  |=  =moment
  |^  ^-  manx
  =,  moment
  =/  zone=tape
    :(weld " (GMT " ?:(p.timezone "+" "-") " " (scow %ud q.timezone) ")")
  ;/  ?~  start.moment  "TBD"
      %+  weld  (make-legible u.start.moment)
      ?~  end.moment  zone
      :: if same day, only render the date once
      =/  render-once=?
        =(d:(yell u.start.moment) d:(yell u.end.moment))
      =+  e=(make-legible u.end.moment)
      :(weld " - " ?:(render-once (slag 11 e) e) zone)
  ::  +make-legible: render @da more legible
  ::
  ::    e.g. ~2023.11.24..22.09.48..43b3  to  2023.11.24  22:09
  ::
  ++  make-legible
    |=  da=@da
    ^-  tape
    =/  date  (yore da)
    =,  date
    =/  yr=tape
      (oust [1 1] (scow %ud y))
    :(weld yr "." (lzr m) "." (lzr d.t) "  " (lzr h.t) ":" (lzr m.t))
  ::  lzr: lead zero, if single digit
  ::
  ++  lzr
    |=  d=@ud
    ^-  tape
    =/  t=tape  (scow %ud d)
    ?:(=(1 (lent t)) (weld "0" t) t)
  --
::  +render-timeline: render events in a timeline, ordered by start date
::
++  render-timeline
  |=  [pulse=?(%active %over) foreign=(map id info)]
  |^  ^-  marl
  =;  tiles=marl
    ;*  tiles
  =/  items=(list [id info])
    ?.  =(~ foreign)
      ~(tap by foreign)
    %+  weld  get-our-records
    (turn ~(tap by events) |=([=id =event] [id info.event]))
  ;*  %+  murn  (order items)
      |=  [=id =info]
      ^-  (unit manx)
      ?-  pulse
        %active  ?:(?=(%over latch.info) ~ `(render-tile id info))
        %over    ?.(?=(%over latch.info) ~ `(render-tile id info))
      ==
  ::  +get-our-records: pull records for which we're a guest
  ::
  ++  get-our-records
    ^-  (list [id info])
    %+  murn  ~(tap bi records)
    |=  [=id =ship =record]
    ?:  =(our.bowl ship.id)  ~
    ?.  =(our.bowl ship)  ~
    `[id info.record]
  ::  +order: put events in order by start date
  ::
  ++  order
    |=  items=(list [id info])
    |^  ^-  (list [id info])
    %+  sort  items
    |=  [[* a=info] [* b=info]]
    =/  a-start  start.moment.a
    =/  b-start  start.moment.b
    ?~  a-start  |
    ?~  b-start  &
    :: if same day, check timezone
    ?.  =(d:(yell u.a-start) d:(yell u.b-start))
      (lth u.a-start u.b-start)
    =/  a-zone  timezone.moment.a
    =/  b-zone  timezone.moment.b
    :: if same zone, check time
    ?:  =(a-zone b-zone)
      (lth u.a-start u.b-start)
    :: account for timezone difference
    %+  gth
      (account-for-zone u.a-start a-zone)
    (account-for-zone u.b-start b-zone)
    ::
    ++  account-for-zone
      |=  [=time zone=timezone]
      ^-  @da
      =/  hour  (to-hour q.zone)
      (?:(p.zone add sub) time hour)
    ::
    ++  to-hour
      |=  zone=@ud
      ^-  @dr
      (slav %dr (crip (weld "~h" (scow %ud zone))))
    --
  ::  +render-tile: make an event as a clickable item in a list
  ::
  ++  render-tile
    |=  [=id =info]
    ^-  manx
    =;  content=manx
      ?:  =(our.bowl ship.id)
        ;li.host
          ;+  content
        ==
      ;li.guest
        ;+  content
      ==
    =/  get-path=tape
      ?:  =(our.bowl ship.id)
        (spud (make-path %manage `id))
      (spud (make-path %event `id))
    ;a(target "_self", href get-path)
      ;div.tile-text.tile-title
        ;+  ;/  (trip title.info)
      ==
      ;div.tile-text
        ;+  (render-moment moment.info)
      ==
      ;div.tile-latch
        ;+  ;/  "{<latch.info>}"
      ==
      ;div.tile-text
        ;code(style "font-size:0.95rem;"): hosted by {<ship.id>}
      ==
      ;+  ?.  =(our.bowl ship.id)  ;p:""
          ;div.tile-text.align-right
            ;+  ;/  ~(registered count id)
          ==
    ==
  --
::
++  style
  ^~
  %-  trip
  '''
  * { margin: 0; padding: 0; }
  :root {
    --black: #000000;
    --white: #fff2e6;
    --red: #4d0000;
    --radius: .4rem;
  }
  html, body {
    font-family: Urbit Sans, Arial;
    font-size: 1.15rem;
    font-weight: 500;
    color: var(--white);
    background: var(--black);
    max-width: 500;
    margin: auto;
  }
  header, nav {
    position: relative;
    padding: 20px 25px 10px 20px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 15px;
  }
  footer {
    font-size: .85rem;
    padding: 2em;
    display: flex;
    flex-direction: row;
    justify-content: center;
  }
  a {
    text-decoration: none;
    color: inherit;
  }
  .link {
    text-decoration: underline;
    color: var(--white);
  }
  span {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 0.2em;
  }
  .red {
    color: red;
  }
  .green {
    color: green;
  }

  /* button styling */
  button {
    padding: 3;
    border: 1px solid var(--white);
    border-radius: var(--radius);
    background-color: var(--white);
    font-family: Urbit Sans, Arial;
    color: black;
    font-size: .9rem;
    font-weight: 700;
    cursor: pointer;
    transition: filter 100ms ease;
  }

  /* form and input styling */
  form {
    display: block;
    gap: 10px;
    margin-block-end: 0;
  }
  .create {
    display: flex;
    flex-direction: column;
    padding: 1em;
  }
  input {
    display: block;
    position: relative;
    width: 100%;
    font-family: Urbit Sans, Arial;
    font-size: 1.05rem;
    color: var(--white);
    background: var(--black);
    border-radius: var(--radius);
    border-color: var(--white);
    border-style: solid;
    border-width: 2px;
    resize: none;
  }
  input.moment {
    color: var(--black);
    background: var(--white);
  }
  .nav-input {
    display: flex;
    flex-direction: row;
    width: 100%;
  }
  select {
    font-family: Urbit Sans, Arial;
    font-size: 1.05rem;
    color: var(--white);
    background: var(--black);
    border-radius: var(--radius);
    border-color: var(--white);
    border-style: solid;
    border-width: 2px;
  }
  textarea {
    display: block;
    width: 100%;
    font-family: Urbit Sans, Arial;
    font-size: 1.15rem;
    color: var(--white);
    background: var(--black);
    border-radius: var(--radius);
    border-color: var(--white);
    border-style: solid;
    border-width: 2px;
  }

  /* misc. styling */
  code {
    font-family: Urbit Sans Mono, Arial;
    font-size: 1.05rem;
  }
  code.stamp {
    font-size: .65rem;
  }
  li {
    display: block;
    position: relative;
    border: 1px solid var(--white);
    border-radius: var(--radius);
    list-style-type: none;
    margin: 1em 0;
    padding: 0.25em;
    font-size: 1rem;
    font-weight: 600;
    text-align: left;
    z-index: 2;
    cursor: pointer;
  }
  .host {
    color: var(--white);
    background: var(--black);
  }
  .guest {
    color: var(--black);
    background: var(--white);
  }
  td {
    padding-top: .5em;
    padding-bottom: .5em;
  }
  .tip {
    cursor: help;
  }
  .context {
    cursor: context-menu;
  }
  .white-border {
    background: var(--black);
    border-radius: var(--radius);
    border-color: var(--white);
    border-style: solid;
    border-width: 2px;
  }

  /* div formatting */
  div {
    display: block;
    padding: 0.2em;
  }
  .align-right {
    display: flex;
    flex-direction: row;
    justify-content: right;
  }
  div.reload {
    display: flex;
    flex-direction: row;
    justify-content: right;
    padding: 2px 25px 2px 0px;
  }
  .timeline {
    position: relative;
    padding: 0 1em 1em;
  }
  .horizontal {
    display: inline-block;
    gap: 15px;
  }
  .over {
    border: 2px dotted var(--white);
    border-radius: var(--radius);
  }
  .title {
    font-size: 2rem;
    font-weight: 700;
    padding-left: 5px;
  }
  .moment {
    font-size: 1.05rem;
    padding: 5px;
  }
  .status {
    padding: 5px;
    padding-top: 10px;
    text-align: right;
  }
  .about {
    padding: 20px 0px 20px 0px;
  }
  .center {
    text-align: center;
  }
  .tile-text {
    padding: 0.15em;
  }
  .tile-title {
    font-size: 1.30rem;
    max-width: 15em;
  }
  .tile-latch {
    position: absolute;
    top: 0.4em;
    right: 0.4em;
    padding: 5px;
    color: var(--black);
    background: var(--white);
    border-radius: var(--radius);
  }
  .records {
    padding-top: 10px;
  }
  .status-section {
    padding: 10px 0px 0px 0px;
  }
  .record-entry {
    color: var(--black);
    background: var(--white);
    border-radius: var(--radius);
    border-color: var(--white);
    border-style: solid;
    border-width: 2px;
  }
  @font-face {
    font-family:Urbit Sans;
    src:url(https://assembly.urbit.org/_next/static/media/UrbitSans-Light.07739c1a.otf);
    font-weight:300;
    font-style:normal
  }
  @font-face {
    font-family:Urbit Sans;
    src:url(https://assembly.urbit.org/_next/static/media/UrbitSans-Regular.108abb2f.otf);
    font-weight:400;
    font-style:normal
  }
  @font-face {
    font-family:Urbit Sans;
    src:url(https://assembly.urbit.org/_next/static/media/UrbitSans-Medium.a5a9ec11.otf);
    font-weight:500;
    font-style:normal
  }
  @font-face {
    font-family:Urbit Sans Mono;
    src:url(https://assembly.urbit.org/_next/static/media/UrbitSansMono-Thin.6a26d201.otf);
    font-weight:200;
    font-style:normal
  }
  @font-face {
    font-family:Urbit Sans Mono;
    src:url(https://assembly.urbit.org/_next/static/media/UrbitSansMono-Light.677d7c8e.otf);
    font-weight:300;
    font-style:normal
  }
  @font-face {
    font-family:Urbit Sans Mono;
    src:url(https://assembly.urbit.org/_next/static/media/UrbitSansMono-Regular.13315be0.otf);
    font-weight:400;
    font-style:normal
  }
  @font-face {
    font-family:Urbit Sans Mono;
    src:url(https://assembly.urbit.org/_next/static/media/UrbitSansMono-Medium.9309e759.otf);
    font-weight:500;
    font-style:normal
  }
  '''
--
