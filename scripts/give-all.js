// Define the module
Hooks.on("ready", () => {
    game.settings.register("my-addon", "itemName", {
        name: "Item to give to players",
        hint: "Enter the name of the item to give to players",
        scope: "world",
        type: String,
        default: "Healing Potion"
    });
});

// Define the chat command
Hooks.on("canvasReady", async () => {
    game.socket.on("system.my-addon", data => {
        let chatData = {
            user: game.user._id,
            content: `Giving all players a ${game.settings.get("my-addon", "itemName")}...`
        };

        ChatMessage.create(chatData);

        // Give all players an item
        game.users.forEach(u => {
            let actor = u.character;
            if (!actor) return;

            let item = actor.items.find(i => i.name === game.settings.get("my-addon", "itemName"));
            if (item) {
                item.increment();
            } else {
                actor.createOwnedItem({
                    name: game.settings.get("my-addon", "itemName")
                });
            }
        });
    });
});

// Define the chat command
Hooks.on("getChatLog", (app, html, data) => {
    html.find(".chat-message").each((i, elem) => {
        let chatData = $(elem).data("message");
        if (chatData.content.startsWith(`/give`)) {
            let action = chatData.content.split(" ")[0].substring(1);
            let args = chatData.content.substring(action.length + 2);

            game.socket.emit(`system.my-addon`, {
                action: action,
                args: args
            });

            return false;
        }
    });
});

// Define the UI
Hooks.on("renderItemSheet", (app, html, data) => {
    // Add the right-click option to the item sheet
    html.find("button.item-control").last().after(`
        <button class="item-control" data-item-name="${data.item.name}">
            Give item to all players
        </button>
    `);

    // Handle the button click
    html.find("button[data-item-name]").click(async event => {
        let itemName = $(event.currentTarget).data("itemName");
        game.settings.set("my-addon", "itemName", itemName);

        let chatData = {
            user: game.user._id,
            content: `Giving all players a ${itemName}...`
        };

        ChatMessage.create(chatData);

        // Give all players an item
        game.users.forEach(u => {
            let actor = u.character;
            if (!actor) return;

            let item = actor.items.find(i => i.name === itemName);
            if (item) {
                item.increment();
            } else {
                actor.createOwnedItem({
                    name: itemName
                });
            }
        });
    });
});

