# Bugs
## Fixed
1. History - state management algorithm (do a double delete > undo 2 times > move object > undo again)
2. Event handlers for drag & drop 
3. Event handlers for delete

## Unfixed
* History is not properly updating for first 2 updates. Appending the first layers array into History on initilisation did not help. (Sakib also has no idea what is going on here)
* Rotation event listeners will need a flattened layers array data structures, a deep watcher which is the current implementation will impact performance significantly and is not specific to rotations only. A deep watcher will not work.



## Project Setup
```sh
npm install

npm run dev

website: https://www.doyour.events/
login: nahidahena888+dooo123@gmail.com
password: Hena@1234
```