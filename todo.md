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
	+ Remove matching functions from guest list
	+ General button feedback so user knows when an action succeeds/fails (e.g. when the profile is updated, the form closes; if it fails they get an error message)
      + feedback for profile update
      + feedback for unmatch on atteneed page
      + feedback for regiister
	+ Mobile menu button adjustments (see ~sarlev's feedback)
      + made menu button bigger, moved it up
      - change background of menu items
      + clicking a menu item clollapses the menu
      + fixed chevron orientation
	+ Need timeline home button, or back button
	+ Event title should be the only header text at the top of an event page.
	+ Hosted by @p (if we have time: include avatar and nickname)
	+ datetimes should be: HH:MM AM/PM (Zone) on Month DD YYYY
	+ Inclue location string on event page
	+ Viewport changes to make map view consistent with rest of pages on mobile. See if we can pinch/zoom.
      + disabled pinch zoom by default on all pages, enabling it programmatically in map page
  - session titles highlight on hover. no need for this, as it feels like a link to something.
  - 'successfully sent registration to event host' should say 'successfully sent entry request to event host'


## Bugs
	x Host needs to see the event and be able to interface with it like guests
      - skip for now
	+ Sometimes have to click attendees button more than once to open
	? Subscription updates don't always automatically appear; e.g. when a new record is added I had to refresh page to see it.
	? PWA was working initally, but eventually got 404 error after clicking around a bit. This hapend when i
	- "No internet connection" message when PWA is offline
    	- Remove match functionality for ourselves
	+ Profile button doesn't work within event home page; does work on timeline page

*these can be skipped in favor of the top priority bugs listed below and Tinderfying the matching feature:*
  - If we're on any sub-page of the event (i.e. guest list, map, schedule) the back button should take us back to the event home page instead of the timeline. It's more intuitive if these are essentially nested.
      - hovering over a provfile should change the cursor to a pointer finger.
  - on mobile: on smaller screens the status button hangs over the event title; can we push the title down a line?
  - event description paragraphs should be aligned margin-left, instead of centered

### Before launch (in order of priority)
  + start and end times on an event page are wrong. seems like it may still have mock data popluated for these fields.
  + session dates also aren't correct. dates in the drop down and within the sessions themselves seem to still have mock data.
  + events/records aren't rendered and we get the console error at the link below when we populate the group field for an event. the group field will arrive as either `null` or an object shaped like '{'ship':'~zod', 'term':'my-event'}'
      - https://zyx.polrel-witter.xyz/scratch/view/bi4sj
  + on mobile: can't scroll to view all profile fields. on home screen i can't exit the view without reloading the page.

### After launch (in order of priority)
  - There's brief delay when clicking into an event which feels like a crash because we get a blank page until the data appears. It's probably the time it takes for the scry to retrieve the data, but the user should know the app is still functioning. I think we should add a loading spinner in the middle of the page, or somewhere where it's obvious, so the user knows the app is doing something. This should appear anytime the frontend is scrying for data or knows it's waiting for an update from the backend (e.g. poking another ship and waiting for some data change).
  - need to iron out all crashing. for any feature that results in an error due to incompletion we need to disable the button/link that leads to the error message. this is currently happening for the 'connections' button and event tiles that we're hosting. from a users pov, it's better not have the chance to click something than to result in an error.
  - If we're not yet registered, the guest list page is blank. If this is the case, it should display a message to direct the user: 'register to this event to see the guest list'
  - after updating the profile the poke succesfully goes through, but a second or two after the form closes if I reopen the profile form the fields aren't populated. I had to close it and reopen it again for them to appear.
        - profile data also doesn't appear within the profile dialog box of an event page; it does on the timeline page, though.
  - on the guest list page, profile fields should not appear if they're null. e.g. avatar, nickname and bio should not be there if they're not set. also lets change 'profile overview' to just 'profile'. it's cleaner
  - caching works, but the app isn't working offline (waiting to see if sarlev also has this problem)
      - not seeing option to install as pwa (in desktop browser); however, on mobile, in Safari I can add it to my homescreen and it works as a PWA.
      - on both desktop and mobile the app stopped working when the connection was lost. we're assuming people at Subassembly aren't going to have an internet connection the entire time so the app should be able to work if they close and reopen it.
  - UX
      - on the guest list page, when an avatar is set, it should swap out the sigil field and render whatever image is set instead. No need to have an avatar field in the profile dropdown.
          - similarly, the nickname should take the place of the @p and rendered next to the sigil/avatar
      - (should be fixed with the subscription to %matcher) new ships added to the guest list don't automatically display; have to refresh to get them to show. it must be due to scrying instead of having a subscription. i think we should dial up the scry frequency, if this is the case.
            - similarly, new events don't auto-appear either. we have to reload to see them.
            - new sessions do populate automatically, though
  - formatting/rendering
      - paragraph breaks aren't recognized (e.g. '\0a's are ignored)
      - location should be placed under the end time; it's difficult to find at the bottm when the event description is long
      - session descriptions don't recognize paragraph breaks (i.e. `\0a's are ignored)
  - wording changes
      - 'attendees' button should be 'guest list', for consistency
      - at the top of the profile form, it should say: 'this information is only shared with ships you match with.'

*after finishing the top priority bugs should move on to finishing the matching feature*

## Features
  + test schedule with live data
	- Tinderfy the matching feature
	- Button to open group chat and DM; no deep linking, just need to open the corresponding URL for the Tlon app
		- Path for group: https://<ship url>/apps/groups/groups/<group host ship>/<group name>/channels
		- Path for dm: https://<ship url>/apps/groups/dm/<target ship>
	+ Sigil rendering (~polrel looking into examples from other apps to understand how to implement)
	+ Avatar rendering (i.e. the %avatar value from the profile object)
	- In-app instructions for installing PWA



# Backend

## Refinements
	+ State upgrades
	+ Prepend agent name in front of all printifs
	- Backend > Frontend error handling (e.g. if a poke doesn't succeed, send feedback to user)
  - Respect calm engine settings
	- Handle tangs so src ship gets feedback on what happened after poke.
	- When someone unmatches us we should delete their private info and wipe from frontend. We do this bc if we rematch later, we'd get new info.
	- Restrict a session's $moment to only happen within the bounds of its event $moment

## Bugs
	+ group JSON decoding isnt working
	+ Problem with frontend when we upgrade the agent; it sends a %handle-http-request to the agent instead of Eyre
	+ problem with unsubing and resubbing to peers mip, see %sss-on-rock branch in %matcher
		+ when we initially sub to the %peers sss path, we get all waves, but should only get the latest rock to avoid complications.
		+ also when registering, unregistering, then reregistring, we don't get the latest peers mip - the host needs to send the full rock
	+ If we register, unregister, and then register again - if the event is private - we're added back to the peers mip even though our status is %requested
  + host adds themselves to the peers mip; need to filter out
  + restore subs and pubs; currently being stubbed. just establish new ones for each event and record
  - for a private or secret event, if you're %registered and then become %unregistered, updates such as session additions, etc. are still sent. this should not happen.

## Features
  - Set up Red Horizon fleet
	- Event-level tagging in %pals
