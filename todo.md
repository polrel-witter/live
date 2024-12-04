# Remaining TODOs for Subassembly
ordered by priority
key:
+ complete task
- incomplete task


# Frontend
## Features
  + Event creation
  + Host dashboard
    + Record list with vetting (record status change buttons)
    + Record counts by status
        - each record should just include: ship name (avatar and nickname if set), status, and status date, with an action button next to it based on what their current status is (e.g. "invite" if unregistered, "register" if requested, "unregister" if registered, etc.)
    + Edit an event
    + Ship inviting
        + should be able to invite more than one at a time
  + event search
      + somewhere on this page we can see our previous search (can be scried from backend state)
  + guest should see their status and date it occured
  + add %pal toggle on profile form
      + 'Automatically add ships you match with as %pals and include the event title as a tag. This change will only take effect on future matches.'
  + on mobile: the frame for the event page is a bit wide; shouldn't have to scroll to the right/left. the boxes and text should be flush with the screen.
    + i think i fixed this already, there's no left-right scroll anymore
  + need to remove the avatar, patp, and nickname from the profile. the patp should just be next to the avatar image, or if a nickname is set in parethesis next to it.
  + @p's show up without the ~ prepended.

## Refinements/bugs
- profile page
    ? the profile form is cut off at the top/bottom of the screen, for
      instance on a 13" macbook. seems like it just needs some padding
      on the top and bottom?
+ [~widmes-hassen] timeline page
    + while i like the tab distinction between host and guests, i don't
      think there's a clear way we can describe the guest portion, as
      they can techincally be invited, request entry, or already be
      registered. so i think the optimal way to create the timeline is
      distinguishing by color: host titles are either black or grey and
      guest tiles are white. having them weaved also improves the UX for
      when you click into a host event and then go back; currently it
      defaults to the guest tab. should definitely keep the search tab
      though.
    + also, there should be an archived tab for events with a latch set
      to %over. this will keep the host and guest tabs clean. other than
      this, I don't think we need to distinguish the latch on the
      timeline page.
    + i like that it just lists the start time/date on the tile, but
      should read: "starts at XX:XX (GMT X) on Some Date". Also note to
      remove the AM/PM.
    + search tab
        + the header text should just read, "search for events" since
          they can technically search for private events, too.
        + the @p and event name fields should assert this format, but
          also include examples to guide the user: '~sampel-palnet' and
          'event-name'
        + there should also be a spinner on the button that changes when
          the result state updates.
    + If there are no events, should see a message with a link out to the urbit events page: "Need event ideas? Check out events happening around the ecosystem at [urbit.org↗](http://urbit.org/events)"
    + timeline should be in ascending order by date (i.e. event closest
      to today should be at the top)
- [~widmes-hassen] host management page
    + remove the AM/PM distinction since it displays a 24 hour clock.
    + we should see `latch` and `kind` status somewhere on the event
      card.
    + need a delete button - with a "are you sure?" pop-up. the poke to send is: `live-operation [[~sampel-palnet %some-event-id] [%delete ~]]` which is just `null`
    + edit event
        + when clicking the event, the update comes through at the top,
          but not in the form itself. i also think it should give a bit
          more user feedback; e.g. closing the edit dropdown or changing
          the edit button when it completes the change.
        ? similarly to the profile form, the session form is cut off on
          the top and bottom of the page on certain screens. may need
          some padding.
        + it doesn't allow the user to edit the group host ship or name.
        + in the session edit form, all times in the start time
          selection are greyed out. when i select the end time, i can go
          back and select a start time. occasionally, some times are
          greyed out but not others.
        + the timezone is effecting how the time is written to state.
          e.g. if the host selects 8:00 and GMT-4 it'll be written as
          4:00 to state. The backend functions on UTC 0, but it should
          not be converting this as the user would then interpret the
          time wrong. the times that are selected should be sent
          directly to the backend without the conversion. this is
          happening in both the event and session time pickers.
        + occasionally, when I tried to submit a new edit - for instance
          after submitting a previous edit - the session section would
          highlight red. i couldn't figure out why, but it seemed to be
          blocking the next update from going through.
        + a few slight changes to the latch and kind descriptions
          (should also be shown on the create page):
              kind:
              the privacy level, which affects the way guests can register.
              public: discoverable and allow guests to register on their own.
              private: discoverable, but guests must request to be registered and you'll need to approve them manually.
              secret: not discoverable and invite-only. once guests receive your invite they can register.

              latch:
              the 'state' of the event.
              open: actively accepting registrants.
              closed: not accepting registrants; this gets triggered automatically when the event participant limit is met.
              over: already took place; archived.
    +  guest status
        + this section should read: 'guest statuses'
        + i think 'timestamp' is a bit clearer than 'changed' for the
          green buttons that reveal the time of the status change.
        ? guest tiles don't expand to the full width of the container on
          non-mobile screens: https://bowl.polrel-witter.xyz/bucket/random/2024.11.22..17.24.46-Screenshot%20from%202024-11-22%2012-24-32.png
      	+ not handling %record updates. updates to records should arrive automatically in this area. e.g. when the host invites someone or an existing guest's status changes.
        + in general, really like how this looks/feels. great work.
+ guest page
    + remove the AM/PM distinction since it displays a 24 hour clock.
    + the description sometimes renders across the screen, i.e. no
      linebreaks.
    + [~widmes-hassen] we should see `latch` and `kind` status somewhere on the event
      card.
    + [~widmes-hassen] if a map url is set and then removed, the map still displays for
      the user. although if the host changes it to a new url, the new one
      displays.
    + [~polrel-witter] when clicking the dm button on a guest, it redirects us to link
      that has an additional '~' prepended to the ship, e.g. `http://localhost:8081/apps/groups/dm/~~bus', need to remove the second one.
    + [~polrel-witter] panel strings aren't parsed correctly on sessions guest view.
- create page
    + clicking 'add session' before filling in any details causes a
      crash: `Cannot read properties of undefined (reading 'valueOf')`
    + [~widmes-hassen] if i click the create button without filling in any fields, the
      group section and sessions are also highlighted red. those aren't
      required so no need to highlight. it also then won't let me create
      the event if i then fill in the required fields.
    + [~polrel-witter] the profile button on this page should be a back button. no need
      to have profile editing on here.
    + [~polrel-witter] on the event creation page, if about, location, venue map, or secret are empty they should be `null`. for both event and sessions. right now they're defaulting to empty strings.
    + [~polrel-witter] if the creation was successful it should redirect them to the
      management page.
    + [~polrel-witter] there's a message that says the location field can't be empty, but it can
    + [~polrel-witter] some field titles have 'event' in front. can get rid of this; e.g.
      'event title' > 'title'
    + [~widmes-hassen] in the event date picker, if we select a date range and click out without clicking 'done' the dates appear to set, but then clicking the 'add session' button leads to a crash.
    + [~polrel-witter] i think there should be some intuitive examples in the group fields to coax correct syntax. for host: ~hoster-palnet; for group name: the-group-name
    - [~widmes-hassen] also including the error messages if they're not properly formatted, like in the invite field would be great.
- the connection status at the bottom right should be more prominant on desktop. when the app first opens it can take a few seconds before anything renders and without noticing the connection status it feels like nothing's happening. it's obvious on mobile, but on desktop it's hard to see. i think either making it bigger or adding a spinner in the middle of the page should fix.
- figure out color scheme
- the register button isn't working right. it seems to send a register poke, but quickly follows with an unregister poke. sometimes the registration appears to go through, but the success pop-up says "you've successfully unregistered to this event".
- when someone has a requested status, the 'status change button' shouldn't be clickable.
- [~polrel-witter] the status, latch and kind buttons on the guest and management event page should show cursor on hover
- [~polrel-witter] there should be a 'guest list' and 'schedule' button on the host management page. they should be able to interface with these two pages like guests.
- the event address is currently hard to find. i think it should go below the end date, above the group link.


# Backend
+ inviting ships doesn't send a local update, to include the new record
  in the guest statuses list. the count does change, though.
    + note: %record update is already included, just not being handled on the frontend
+ parsing the panel is off; sometimes inserts double commas, and puts
  commas between first and last names.
    + note: backend is parsing the panel properly, the frontend just needs to render the string instead of reparsing.
+ parse group names no matter the input type.
- panel conversion back to json not working
- update README


# Archived
## Frontend
  + test schedule with live data
	+ Tinderfy the matching feature
	+ Button to open group chat and DM; no deep linking, just need to open the corresponding URL for the Tlon app
		- Path for group: https://<ship url>/apps/groups/groups/<group host ship>/<group name>/channels
		- Path for dm: https://<ship url>/apps/groups/dm/<target ship>
	+ Sigil rendering (~polrel looking into examples from other apps to understand how to implement)
	+ Avatar rendering (i.e. the %avatar value from the profile object)
  + the @p's need the ~ prepended to them. this is why the DM button isn't working properly. the ship in the Tlon path needs the ~ included: <url>/apps/groups/dm/~zod
  + event title is pulling the event name from the id. it should specfically pull the event title.
  + schedule isn't showing all dates; the date dropdown function is only showing some sessions, but not all.
      + on sessions and event times, we should get rid of the AM/PM distiction since they're on 24hour clock.
  + not including the end date in a session will cause the frontend to not display the event
  + PWA works if you're using the app and then cut the internet connection, but if you start the app without an internet connection data does not popluate. ~sarlev got the same result. Seems like it might need more caching or something.
  + sigils aren't displaying
      + if needed, here's an example from Tlon: https://github.com/tloncorp/tlon-apps/blob/develop/apps/tlon-web/src/components/Avatar.tsx#L1
        + profile data also doesn't appear within the profile dialog box of an event page; it does on the timeline page, though.
  + on the guest list page, profile fields should not appear if they're null. e.g. avatar, nickname and bio should not be there if they're not set. also lets change 'profile overview' to just 'profile'. it's cleaner
  + on the guest list page, when an avatar is set, it should swap out the sigil field and render whatever image is set instead. No need to have an avatar field in the profile dropdown.
  + at the top of the profile form, it should say: 'this information is only shared with ships you match with.'
	+ "No internet connection" message when PWA is offline
  + on mobile: on smaller screens the status button hangs over the event title; can we push the title down a line?
  + start and end times on an event page are wrong. seems like it may still have mock data popluated for these fields.
  + session dates also aren't correct. dates in the drop down and within the sessions themselves seem to still have mock data.
  + events/records aren't rendered and we get the console error at the link below when we populate the group field for an event. the group field will arrive as either `null` or an object shaped like '{'ship':'~zod', 'term':'my-event'}'
      - https://zyx.polrel-witter.xyz/scratch/view/bi4sj
  + on mobile: can't scroll to view all profile fields. on home screen i can't exit the view without reloading the page.
  + If we're on any sub-page of the event (i.e. guest list, map, schedule) the back button should take us back to the event home page instead of the timeline. It's more intuitive if these are essentially nested.
      + hovering over a provfile should change the cursor to a pointer finger.
  + on mobile: on smaller screens the status button hangs over the event title; can we push the title down a line?
  + If we're not yet registered, the guest list page is blank. If this is the case, it should display a message to direct the user: 'register to this event to see the guest list'
  + (should be fixed with the subscription to %matcher) new ships added to the guest list don't automatically display; have to refresh to get them to show. it must be due to scrying instead of having a subscription. i think we should dial up the scry frequency, if this is the case.
  + after updating the profile the poke succesfully goes through, but a second or two after the form closes if I reopen the profile form the fields aren't populated. I had to close it and reopen it again for them to appear.
  + the 'connected' footer bar is mega huge on desktop; i'd put it in the nav bar on desktop (low priority nitpick)
      + connection status bar slightly covers the contents at the bottom of the page. e.g. if the guest list spans the full page the bottom profile is slightly covered. just need to either move the bar down a tad or need a little more padding at the bottom of the page.
  + the connection status doesn't change to 'connected' after cutting the internet connection then reconntecting
  + event description paragraphs should be aligned margin-left, instead of centered
	x Host needs to see the event and be able to interface with it like guests
      - skip for now
	+ Sometimes have to click attendees button more than once to open
	? Subscription updates don't always automatically appear; e.g. when a new record is added I had to refresh page to see it.
	? PWA was working initally, but eventually got 404 error after clicking around a bit. This hapend when i
	+ "No internet connection" message when PWA is offline
    	- Remove match functionality for ourselves
	+ Profile button doesn't work within event home page; does work on timeline page
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
      + change background of menu items
      + clicking a menu item clollapses the menu
      + fixed chevron orientation
	+ Need timeline home button, or back button
	+ Event title should be the only header text at the top of an event page.
	+ Hosted by @p (if we have time: include avatar and nickname)
	+ datetimes should be: HH:MM AM/PM (Zone) on Month DD YYYY
	+ Inclue location string on event page
	+ Viewport changes to make map view consistent with rest of pages on mobile. See if we can pinch/zoom.
      + disabled pinch zoom by default on all pages, enabling it programmatically in map page
    + session titles highlight on hover. no need for this, as it feels like a link to something.
    + 'successfully sent registration to event host' should say 'successfully sent entry request to event host'
	+ connections page
		+ the shake goes through, after clicking the "+" (or "x") button, but we get a blank page.
		+ similarly, when we unmatch with someone, it goes through and reloads the guest page, but it's blank.
		+ i think this should go above the profile tiles: "Match with guests to share your profile info. Requests are sent to the event host, who will then "introduce" you should your request become mutual. Your profile data is stored locally and sent directly to guests you match with."
    + it should filter out ourselves
		+ to avoid moving the mouse or your finger up and down, i think the action buttons on profiles within the connections page should be directly below the avatar/sigil. since the profile info will vary in size.
	+ guest list page
		+ clicking unmatch sometimes will open the profile dropdown. this particularly happens when the button is grayed out.
		+ also, i think the profile box on the guest list would look slightly better justified-left, directly under the avatar. It appears centered when info in the profile doesn't span the full width of the card.
  + on the guest list page, for each guest, i think it's better to have the '...' dialog box inline with the @p/avatar/sigil so that if the profile is blank, we don't have to include a dropdown section.


## Backend
	+ State upgrades
	+ Prepend agent name in front of all printifs
	+ group JSON decoding isnt working
	+ Problem with frontend when we upgrade the agent; it sends a %handle-http-request to the agent instead of Eyre
	+ problem with unsubing and resubbing to peers mip, see %sss-on-rock branch in %matcher
		+ when we initially sub to the %peers sss path, we get all waves, but should only get the latest rock to avoid complications.
		+ also when registering, unregistering, then reregistring, we don't get the latest peers mip - the host needs to send the full rock
	+ If we register, unregister, and then register again - if the event is private - we're added back to the peers mip even though our status is %requested
  + host adds themselves to the peers mip; need to filter out
  + restore subs and pubs; currently being stubbed. just establish new ones for each event and record
  + for a private or secret event, if you're %registered and then become %unregistered, updates such as session additions, etc. are still sent. this should not happen.
	+ Restrict a session's $moment to only happen within the bounds of its event $moment
  + moment sanity check; make sure start comes before end
  + by 10/28, Json conversions for the remainder of the actions
    + live
        + remaining demands
        + find
        + search result updates
            + when scry result comes in, extract name from path
            + test
            + consolidate result update into one arm and call at each instance
  + get-our-case is failing after second time we try to pass something through +change-info
	+ Event-level tagging in %pals
    + toggle %pals setting
  + include a changelog.txt in desk
  + Update README and get rid of %docs
