# Overview
%live is a protocol and web app for organizing social events. It's best approached from two perspectives:

### As an event host
The core data structure is an `$event` which consists of the following:
- Basic info: title, description, location, venue map, a start and end date, the  kind of event (public, private, or secret), status of the event (open, closed, over).
- A series of sessions within the event (i.e. sub events).
- An optional secret, which is a message only sent to registered guests and those marked as attended.
- A possible limit on the number of accepted registrants.
- A Tlon group link.

Once an event is written to state, the host can begin building a guest list, stored as `$record`s. This can be done in one of two ways: either by inviting ships directly or sharing the event link so that others can find it.

Event discoverability functions differently based on its `$kind`. Public and Private events can be found through the search feature; Secret events are hidden, in which case hosts must invite ships themselves.

Additionally, `$record` status changes will behave differently according to these types:
- `%public`: anyone can send a `%register` poke and get a `%registered` status.
- `%private`: if a `%register` poke is sent the guest's status will initiate to `%requested` forcing the host to register them, unless the host invites them first.
- `%secret`: invite-only.

Finally, the status of an event (i.e. its `$latch`) will also change its registration behavior:
- `%open`: actively accepting registrants.
- `%closed`: all `%register` pokes will default to a `%requested` status.
- `%over`: the event is archived so any pokes (excluding a `$latch` change) won't process.

### As a guest
With a `$record` to an event, a guest will have one of 5 statuses:
- `%invited` (ditto)
- `%requested` (requesting access to a private or closed event; subject to host
  approval)
- `%registered` (has access to the event)
- `%unregistered` (registration was revoked either by the host or guest
  themselves)
- `%attended` (for host bookkeeping purposes, indicating we 'showed up')

A `$record` contains the event `$info`, as well as, guest access data (status and time of status change) and the event `$secret` if the status is `%registered` or `%attended`.

#### Matching
As a way to facilitate guest networking, `%live` includes a matching feature. This begins with a guest setting their profile (i.e. contact fields such as github, x handle, etc), which is stored locally and sent to guests they match with.

Within the event page there's a Connections tab that will display guest profiles individually, giving the option to match. When a guest initiates a match request, the `%matcher` agent sends a positive `%shake` poke to the host ship where the connection status is stored locally until the recipient initiates a postive `%shake` on their own accord. The host ship notifies both parties of the match when it becomes mutual. At this point profile info is shared with each other, directly. Profile data is never sent to the host, unless a guest matches with them.

As the host, this operation is handled in the background, automatically.

# Pokes
## %live
Most pokes are event-specific and sent via an `$operation`. An operation requires the event `$id` and an `$action` to be performed on the event. All actions are explained in `desk/sur/live.hoon`.

Non-event-specific pokes take a `$dial`, which includes a `%find` and `%case` option. `%find` is an external event search and `%case` is a purely backend function: used to obtain the remote scry endpoint's 'latest' revision number.

## %matcher
There are two poke types:
- `$dictum` a host-only action
- `$deed` a host or guest action

All pokes are defined in `desk/sur/matcher.hoon`. The only ones that aren't implicitly handled by `%matcher` are `%edit-profile` and `%shake`, to change profile info and match with guests, respectively.

# Scries
## %live
The `%live` agent contains the following scry endpoints. Each result in a `$demand` type, defined in `/desk/sur/live.hoon`. References to 'host ship' and 'name' correlate to the event id: `[=ship name=term]`.

### %u scries
`/event/exists/[host ship]/[name]` -> does an event exist?

`/record/exists/[host ship]/[name]/[guest ship]` -> does a record exist?

### %x scries
`/result` -> latest search result

`/events/all` -> a map of all events

`/records/all` -> a mip of all records

`/events/remote` -> a map of events discoverable over remote scry (i.e. %public and %private that aren't %over)

`/records/[host ship]/[name]` -> a map of all records for a specific event

`/event/[host ship]/[name]` -> an event

`/session/ids/[host ship]/[name]` -> all session ids and their corresponding title for an event

`/record/[host ship]/[name]/[guest ship]` -> a record

`/counts/[host ship]/[name]` -> a map of record statuses with their cumulative
totals

## %matcher
These result in a `$demand` type defined in `desk/sur/matcher.hoon`.

### %u scries
`/pals/add` -> toggle whether matches should be added to %pals

### %x scries
`/pals/add` -> boolean setting indicating whether we're converting matched ships to %pals and adding event tags

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

There's also a local subscription maintained for frontend updates in each agent:
- %matcher: `/updates/`
- %live: `/updates`, `/errors`, and `/search`

# Install
### On Urbit
`|install ~mocbel %live`

### From source
1. create a blank desk: `|new-desk %live`
2. mount to filesystem: `|mount %live`
3. sync this repo with mounted desk: `rsync -avL <this repo> <mounted desk in pier>`
4. `|commit %live`
5. `|install our %live`

# Feedback and support
For feedback/support, please dm `~polrel-witter` on Urbit or [@polrel_wittter](https://x.com/polrel_witter) on X.
