# Overview
%live gives users a basic set of tools to organize an event (parties,
meetings, weddings, meetups, etc.). It's best approached from two
perspectives:

### As a host
*the frontend host dashboard is currently under development; for now all
host actions can only be done through the dojo*

I can create an `$event`, which is static data stored in our state as an
`$events` map. It consists of the following:
- Basic info, which includes: title, description, a start and end date, the
  kind of event (public, private, or secret) and a latch (open, closed,
  over).
- A series of sessions within the event.
- An optional secret, which is a message only sent to registered guests and
those marked as attended.
- A possible limit on the number of accepted registrants

Once an event is written to state, the host can begin building a
guest list, stored as `$record`s. They can do so in one of two ways: either by
inviting ships directly, or sharing their event link so that others
can find it.

Event discoverability functions differently based on its `$kind`. Public
and Private events can be found through the search feature; Secret
events are hidden, so in this case, hosts must invite ships themselves.

Additionally, `$record` status changes will behave differently according to
these types. For Public events, anyone can send a register poke and get
a `%registered` status; for Private ones, their status will initiate to
`%requested` forcing the host to register them, unless the host
invites them first. Secret events are invite-only.

Finally, if a `$latch` is `%open` it means registrants are actively
accepted; `%closed` will default all `%register` pokes to a `%requested` status;
and `%over` means the event's been archived so any pokes (excluding a
`$latch` change) will fail.

### As a guest
With a record to an event, we'll have one of 5 statuses:
- `%invited` (ditto)
- `%requested` (requesting access to a private or closed event; subject to host
  approval)
- `%registered` (has access to the event)
- `%unregistered` (registration was revoked either by the host or guest
  themselves)
- `%attended` (for host bookkeeping purposes)

A record will have the event info, and if we're also
`%registered` or have an `%attended` status, we'll have the host's
secret.

#### Matching
As a way to facilitate guest networking during or after an event,
`%live` includes a matching feature. This begins with a guest setting their
profile (i.e. contact fields such as github, x handle, etc), which is stored locally, then sent to guests they match with.

Within the event page there's a Connections tab that will display guest
profiles individually, giving the option to match. When a guest initiates
a match request, the `%matcher` agent sends a positive `%shake` poke to
the host ship where the connection status is stored locally until the
recipient initiates a postive `%shake` on their own accord. The host
ship notifies both parties of the match when it becomes mutual. At this point profile info is shared with each other, directly. Profile data is never sent to the host, unless a guest matches with them.

# Pokes
## %live
Most pokes are event-specific and sent via an `$operation`. An operation
requires the event `$id` and an `$action` to be performed on the event.
All actions are explained in `desk/sur/live.hoon`.

Non-event-specific pokes take a `$dial`, which includes a `%find` and
`%case` option. `%find` is an external event search and `%case` is a
purely backend function: used to obtain the remote scry endpoint's
'latest' revision number. This was included as a workaround until this
type of scrying is supported on the kernel level.

## %matcher
There are two poke types:
- `$dictum` a host-only action
- `$deed` a host or guest action

All pokes are defined in `desk/sur/matcher.hoon`. The only ones that aren't implicitly handled by `%matcher` or `%live` are `%edit-profile` and `%shake`, to respectively change profile info and match with guests.

# Scries
## Live
The `%live` agent contains the following scry endpoints. Each result in
a `$demand` type, defined in `/desk/sur/live.hoon`. References to 'host ship' and 'name' correlate to the event id: `[=ship name=term]`.

### %u scries
`/event/exists/[host ship]/[name]` -> does an event exist?

`/record/exists/[host ship]/[name]/[guest ship]` -> does a record exist?

### %x scries
`/event/[host ship]/[name]` -> an event

`/record/[host ship]/[name]/[guest ship]` -> a record

`/counts/[host ship]/[name]` -> a map of record statuses with their cumulative
totals

`/events/all` -> a map of all events

`/session/ids/[host ship]/[name]` -> all session ids and their corresponding
title for an event

`/records/all` -> a mip of all records

`/records/[host ship]/[name]` -> a map of all records for a specific event

## Matcher
These result in a `$demand` type defined in `desk/sur/matcher.hoon`.

### %x scries
`/profile/[ship]` -> a profile

`/all/profiles` -> a map of all profiles

`/peer-status/[host ship]/[name]/[ship]` -> a peer's status

`/peers/[host ship]/[name]` -> a map of all peers

`/matches/[host ship]/[name]` -> a map of matches (only the host will
have this data)

`/reaches/[host ship]/[name]` -> a map of initialized matches, i.e. not
yet mutual (only the host will have this data)

# Subscriptions
Backend solid state subscriptions are maintained in `%live` and `%matcher` to keep `$record`s and peer `$status`es in sync between host and guests.

There's also a local subscription maintained for frontend updates in
each agent, on the `/updates` path respectively.

# Install
### On Urbit
`|install ~mocbel %live`

### From source
1. create a blank desk: `|new-desk %live`
2. mount to filesystem: `|mount %live`
3. sync this repo with mounted desk: `rsync -avL <this repo> <mounted desk in pier>`
4. `|commit %live`
5. `|install our %live`
