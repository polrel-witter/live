::  %live: event management
::
/-  chat
|%
::  $id: event identifier
::
+$  id  [=ship name=term]
::  $moment: event duration
::
+$  moment  [start=(unit time) end=(unit time)]
::  +club-id: chat identifier, pulled from whom:chat
::
+$  club-id  [%club p=id:club:chat]
::  $limit: number of ships that can register per event
::
+$  limit  (unit @ud)
::  $info: metadata for an event
::
+$  info
  $:  title=cord
      about=cord
      =moment
      status=?(%open %closed)
  ==
::  $event: main event info controlled by host ship
::
::   a secret is some data the host only sends to %registered guests
::
+$  event
  $:  =info
      require-application=?
      =limit
      secret=(unit cord)
      chat=(unit club-id)
  ==
::  $record-status: ship participation status
::
::    %applied: requested to register
::    %registered: permitted access to the event
::    %unregistered: previously registered, but is no longer
::    %attended: showed up to the event
::
+$  record-status
  $?  %applied
      %registered
      %unregistered
      %attended
  ==
::  $record: guest information
::
+$  record
  $:  =info
      application=(unit cord)
      history=(list (pair record-status time))
      secret=(unit cord)
      chat=(unit club-id)
  ==
::  $flyer: event webpage
::
::    a host can include application or registration links to one or
::    more events
::
+$  flyer
  $:  events=(set id)
      html=cord
      md=cord
      bg-color=@ux
      text-color=@ux
  ==
::  $settings-action: local settings toggle
::
+$  settings-action  $%([%timezone (pair ? @ud)])
::  $flyer-action: event page api
::
+$  flyer-action
  $%  [%save-flyer =path =flyer]
      [%delete-flyer =path]
  ==
::  $event-action: event api
::
+$  event-action
  $%  [%create-event =event]
      [%delete-event ~]
      [%require-app ?]
      [%set-info =info]
      [%set-secret (unit cord)]
      [%set-limit =limit]
      [%add-chat (unit club-id)]
      [%remove-chat ~]
    ::
      [%subscribe ~]
      [%apply =cord]
      [%register who=(unit ship)]
      [%unregister who=(unit ship)]
      [%punch =ship]
      [%delete-record =ship]
  ==
::  $event-operation: send an event action
::
+$  event-operation  [=id =event-action]
--
