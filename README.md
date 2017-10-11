## What?

This is a PWA for playing Zahwa recipes created by the Zahwa mobile app.

## Why?

Previously, Zahwa implemented both web (PWA) and mobile (Cordova) views. Zahwa is a large app and it's unweildy to maintain PWA + Cordova plugin cases in every component.

This viewer will turn into the project web site for Zahwa's data consisting of two entry points. The first being a map and data viz page on the index, and the other being deep linked recipe viewer intended to share recipe URLs on the open web without a Zahwa account.

## Differences

Zviewer uses minimal components from Zahwa with a simpler data model.

Zviewer does not lazy load and has a single service that fetches recipe assets rather than the array of different provides and syncing services of Zahwa. Zviewer depends on a hosted firebase function to serve a bundle of all of a recipe data from a single API call rather than including Zahwa's Firebase/offline hybrid data model.

Zviewer also has no notion of authentication and cannot perform any of the social functions of the app.



