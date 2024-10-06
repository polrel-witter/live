# Remaining TODOs for Subassembly
ordered by priority
key:
+ complete task
- incomplete task


# Frontend

## Refinements
	+ Don't show attendees button unless their guest status is either %registered or %attended, or they're the host. Also we should rename the buttons to "guest list"
	+ Timeline: visually distinguish between record and event
	+ Should see our record status on event page and include the status change button in here instead of on the timeline card.
		+ The entire event/record tiles on the Timeline page should be clickable, opening the event details.
	- Remove matching functions from guest list
	- General button feedback so user knows when an action succeeds/fails (e.g. when the profile is updated, the form closes; if it fails they get an error message)
	- Mobile menu button adjustments (see ~sarlev's feedback)
	- Need timeline home button, or back button
	- Event title should be the only header text at the top of an event page.
	- Hosted by @p (if we have time: include avatar and nickname)
	- datetimes should be: HH:MM AM/PM (Zone) on Month DD YYYY
	- Inclue location string on event page
	- Viewport changes to make map view consistent with rest of pages on mobile. See if we can pinch/zoom.

## Bugs
	- Host needs to see the event and be able to interface with it like guests
	- Sometimes have to click attendees button more than once to open
	- Subscription updates don't always automatically appear; e.g. when a new record is added I had to refresh page to see it.
	- PWA was working initally, but eventually got 404 error after clicking around a bit. This hapend when i
	- "No internet connection" message when PWA is offline
    	- Remove match functionality for ourselves
	- Profile button doesn't work within event home page; does work on timeline page

## Features
	- Tinderfy the matching feature
	- Button to open group chat and DM; no deep linking, just need to open the corresponding URL for the Tlon app
		- Path for group: https://<ship url>/apps/groups/groups/<group host ship>/<group name>/channels/chat/<chat channel id>
		- Path for dm: https://<ship url>/apps/groups/dm/<target ship>
	- Sigil rendering (~polrel looking into examples from other apps to understand how to implement)
	- Avatar rendering (i.e. the %avatar value from the profile object)
	- In-app instructions for installing PWA



# Backend

## Refinements
	- State upgrades
	- When someone unmatches us we should delete their private info and wipe from frontend. We do this bc if we rematch later, we'd get new info.
	- Backend > Frontend error handling (e.g. if a poke doesn't succeed, send feedback to user)
	- Handle tangs so src ship gets feedback on what happened after poke.
	- Restrict a session's $moment to only happen within the bounds of its event $moment
	- Prepend agent name in frontd of all printifs
	- Can we serve frontend over http instead of ames?

## Bugs
	- group JSON decoding isnt working
	- Problem with frontend when we upgrade the agent; it sends a %handle-http-request to the agent instead of Eyre
	- If we register, unregister, and then register again - if the event is private - we're added back to the peers mip even though our status is %requested
	- problem with unsubing and resubbing to peers mip, see %sss-on-rock branch in %matcher
		- when we initially sub to the %peers sss path, we get all waves, but should only get the latest rock to avoid complications.
		- also when registering, unregistering, then reregistring, we don't get the latest peers mip - the host needs to send the full rock

## Features
	- Event-level tagging in %pals
	- Sigil rendering. Is this a backend or frontend function?