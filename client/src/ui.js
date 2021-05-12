
// export class UIController {
//     constructor() {
//         if (UIController.keys == undefined) {
//             this.initializeButtons();
//         }

//     }

//     initializeButtons() {
//         // Static var so every module can access it via reference.
//         UIController.keys = [...new Array(256)].map(e => false);

//         // Toggles keystrokes
//         document.body.addEventListener('keydown', event => { UIController.keys[event.keyCode] = true; console.log(UIController.keys)});
//         document.body.addEventListener('keyup', event => { UIController.keys[event.keyCode] = false; });
//     }
// }

// export const keys = UIController.keys;