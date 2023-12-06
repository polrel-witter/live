# Live
Event coordination

# Overview
%live gives users a basic set of tools to organize an event (parties,
meetings, weddings, meetups, etc.). It's best approached from two
perspectives:

### As a host
I can create an `$event`, which is static data stored in our state as an
`$events` map. It consists of the following:
- Basic info, which includes: title, description, a start and end date, the
  kind of event (public, private, or secret) and a latch (open, closed,
  over).
- An optional secret, which is a message only sent to registered guests and
those who 'attended'.
- A possible limit on the number of accepted registrants

Once an event is written to state, the host can begin building a
guest list (i.e. `$records`). They can do so in one of two ways: either by
inviting ships directly, or sharing their event link so that others
can find it.

Event discoverability functions differently based on its `$kind`. Public
and Private events can be found through the search feature; Secret
events are hidden, so in this case, hosts must invite ships themselves.

Additionally, `$record` status changes will behave differently according to
these types. For Public events, anyone can send a register poke and get
a `%registered` status; for Private ones, their status will initiate to
`%requested` forcing the host to register them, unless of course the host
invites them first. As mentioned, Secret events are invite-only.

Finally, if a `$latch` is `%open` it means registrants are actively
accepted; `%closed` will default all `%register` pokes to a `%requested` status;
and `%over` means the event's been archived so any pokes (excluding a
`$latch` change) will fail.

### As a guest
With a record to an event, we'll have one of 5 statuses:
- invited
- requested (requesting access to a private or closed event; subject to host
  approval)
- registered
- unregistered (registration was revoked either by the host or guest
  themselves)
- attended (validated by the host)

A record will have the event info, and if we're also
`%registered` or have an `%attended` status, we'll have the host's
secret.

# Pokes
Most pokes are event-specific and sent via an `$operation`. An operation
requires the event `$id` and an `$action` to be performed on the event.
All actions are explained in `/sur/live`.

Non-event-specific pokes take a `$dial`, which includes a `%find` and
`%case` option. `%find` is an external event search and `%case` is a
purely backend function: used to obtain the remote scry endpoint's
'latest' revision number. This was included as a workaround until this
type of scrying is supported on the kernel level.

# Scries
The `%live` agent contains the following scry endpoints. Each result in
a `$demand` type, defined in `/sur/live`. References to 'host ship' and
'name' correlate to the event id, which is defined in `/sur` as `[=ship
name=term]`.

### %u scries
`/event/exists/[host ship]/[name]` -> does an event exist?
`/record/exists/[host ship]/[name]/[guest ship]` -> does a record exist?

### %x scries
`/event/[host ship]/[name]` -> an event
`/record/[host ship]/[name]/[guest ship]` -> a record
`/counts/[host ship]/[name]` -> a map of record statuses with their cumulative
totals
`/events/all` -> a map of all events
`/records/all` -> a mip of all records
`/records/[host ship]/[name]` -> a map of all records for a specific event

# Subscriptions
The only subscriptions maintained are between host and guests to keep
`$records` in sync and a basic Eyre connection for the frontend.

We use Solid State Subscriptions for the record maintenance. The `$lake` is
found in `/sur/live-records`. It simply defines the `$rock` and `$wave` as a
single `$record`. These updates are processed in `%live`'s `+poke` arm,
under the `%sss-on-rock` branch (see details on SSS
[here](https://github.com/wicrum-wicrun/sss/blob/master/urbit/app/simple.hoon))
. We mostly just write these changes to our `$records` map after running
a few tests.

# A brief note on the frontend
This was written in Sail and uses [htmx](https://htmx.org/) to acheive
reactivity. All frontend code can be found in `/lib/live-view`.
`/lib/live-help` and `/lib/live-icons` contain a few auxiliary components
which are imported into `live-view`.

The "glue" that handles the get/post requests is in the `%live` agent
under the `+handle-http` arm.

