var KEY_ENTER = 13;
$(document).ready(function() {
    var $input = $(".chat-input"),
        $sendButton = $(".chat-send"),
        $messagesContainer = $(".chat-messages"),
        $messagesList = $(".chat-messages-list"),
        $effectContainer = $(".chat-effect-container"),
        $infoContainer = $(".chat-info-container")

    , messages = 0, bleeding = 100, isFriendTyping = false, incomingMessages = 0, lastMessage = "";

    var typing = "Nieves-bot is typing...";
    var plantilla = "Mmm...";
    var replies = [
        { id: 0, state: "not-understood", text: ["I can't understand you, as a beta chatbot I'm still learning language :) ", "say 'help' and I'll tell you what I can do."] },
        { id: 1, state: "hello", text: ["hello! nice to meet you :D What do you want to know about me?"] },
        { id: 2, state: "bye", text: ["hope I helped you! I'm continuosly learning, come back to discover what I've learned.. See you soon!"] },
        { id: 3, state: "help", text: ["what I can do? ask me about how to contact me or where to read more about my interests"] },
        { id: 8, state: "read", text: ["read me at twitter or medium, which one do you prefer?"] },
        { id: 9, state: "contact", text: ["right now, there are 2 ways, twitter or linkedin?"] },
        { id: 10, state: "twitter", text: ["<a href='https://twitter.com/nieves_as'>@nieves_as</a>", "follow me to read about lean startup, technology, product design, chatbots, NLP, artificial intelligence...", " and send me a twitter message if you want to know more :)"] },
        { id: 11, state: "linkedin", text: ["<a href='https://www.linkedin.com/in/nievesabalosserrano'>/in/nievesabalosserrano</a>", "send me a linkedin message to contact! ", "and review my profile to know more about my experience"] },
        { id: 12, state: "medium", text: ["read my latests posts here:", "<a href='https://medium.com/@nieves_as'>@nieves_as</a>"] }
    ];



    function gooOn() {
        setFilter('url(#goo)');
    }

    function gooOff() {
        setFilter('none');
    }

    function setFilter(value) {
        $effectContainer.css({
            webkitFilter: value,
            mozFilter: value,
            filter: value,
        });
    }

    function addMessage(message, self) {
        var $messageContainer = $("<li/>")
            .addClass('chat-message ' + (self ? 'chat-message-self' : 'chat-message-friend'))
            .appendTo($messagesList);
        var $messageBubble = $("<div/>")
            .addClass('chat-message-bubble')
            .appendTo($messageContainer);
        $messageBubble.html(message);

        var oldScroll = $messagesContainer.scrollTop();
        $messagesContainer.scrollTop(9999999);
        var newScroll = $messagesContainer.scrollTop();
        var scrollDiff = newScroll - oldScroll;
        TweenMax.fromTo(
            $messagesList, 0.4, {
                y: scrollDiff
            }, {
                y: 0,
                ease: Quint.easeOut
            }
        );

        return {
            $container: $messageContainer,
            $bubble: $messageBubble
        };
    }

    function sendMessage() {
        var message = $input.text();

        if (message == "") return;

        lastMessage = message;

        //console.log("Acabo de recibir un mensaje del visitante:");
        //console.log(message);
        ga('send', 'event', 'send-message', 'Chat', message);

        var messageElements = addMessage(message, true),
            $messageContainer = messageElements.$container,
            $messageBubble = messageElements.$bubble;

        var oldInputHeight = $(".chat-input-bar").height();
        $input.text('');
        updateChatHeight();
        var newInputHeight = $(".chat-input-bar").height();
        var inputHeightDiff = newInputHeight - oldInputHeight

        var $messageEffect = $("<div/>")
            .addClass('chat-message-effect')
            .append($messageBubble.clone())
            .appendTo($effectContainer)
            .css({
                left: $input.position().left - 12,
                top: $input.position().top + bleeding + inputHeightDiff
            });


        var messagePos = $messageBubble.offset();
        var effectPos = $messageEffect.offset();
        var pos = {
            x: messagePos.left - effectPos.left,
            y: messagePos.top - effectPos.top
        }

        var $sendIcon = $sendButton.children("i");
        TweenMax.to(
            $sendIcon, 0.15, {
                x: 30,
                y: -30,
                force3D: true,
                ease: Quad.easeOut,
                onComplete: function() {
                    TweenMax.fromTo(
                        $sendIcon, 0.15, {
                            x: -30,
                            y: 30
                        }, {
                            x: 0,
                            y: 0,
                            force3D: true,
                            ease: Quad.easeOut
                        }
                    );
                }
            }
        );

        gooOn();


        TweenMax.from(
            $messageBubble, 0.8, {
                y: -pos.y,
                ease: Sine.easeInOut,
                force3D: true
            }
        );

        var startingScroll = $messagesContainer.scrollTop();
        var curScrollDiff = 0;
        var effectYTransition;
        var setEffectYTransition = function(dest, dur, ease) {
            return TweenMax.to(
                $messageEffect, dur, {
                    y: dest,
                    ease: ease,
                    force3D: true,
                    onUpdate: function() {
                        var curScroll = $messagesContainer.scrollTop();
                        var scrollDiff = curScroll - startingScroll;
                        if (scrollDiff > 0) {
                            curScrollDiff += scrollDiff;
                            startingScroll = curScroll;

                            var time = effectYTransition.time();
                            effectYTransition.kill();
                            effectYTransition = setEffectYTransition(pos.y - curScrollDiff, 0.8 - time, Sine.easeOut);
                        }
                    }
                }
            );
        }

        effectYTransition = setEffectYTransition(pos.y, 0.8, Sine.easeInOut);

        // effectYTransition.updateTo({y:800});

        TweenMax.from(
            $messageBubble, 0.6, {
                delay: 0.2,
                x: -pos.x,
                ease: Quad.easeInOut,
                force3D: true
            }
        );
        TweenMax.to(
            $messageEffect, 0.6, {
                delay: 0.2,
                x: pos.x,
                ease: Quad.easeInOut,
                force3D: true
            }
        );

        TweenMax.from(
            $messageBubble, 0.2, {
                delay: 0.65,
                opacity: 0,
                ease: Quad.easeInOut,
                onComplete: function() {
                    TweenMax.killTweensOf($messageEffect);
                    $messageEffect.remove();
                    if (!isFriendTyping)
                        gooOff();
                }
            }
        );

        messages++;

        var code = understandMessage(message);

        getReply(code);

        //if(Math.random()<0.65 || lastMessage.indexOf("?")>-1 || messages==1) getReply();
    }


    function understandMessage(message) {
        message = message.toLowerCase();
        //console.log("Entiendo el mensaje recibido por el visitante....");
        //console.log(message);

        var replyCode = 0;

        if (message.includes("hola")) {
            replyCode = 1;
        }
        if (message.includes("hello")) {
            replyCode = 1;
        }
        if (message.includes("bye")) {
            replyCode = 2;
        }
        if (message.includes("help")) {
            replyCode = 3;
        }
        if (message.includes("read")) {
            replyCode = 8;
        }
        if (message.includes("contact")) {
            replyCode = 9;
        }
        if (message.includes("twitter")) {
            replyCode = 10;
        }
        if (message.includes("linkedin")) {
            replyCode = 11;
        }
        if (message.includes("medium")) {
            replyCode = 12;
        }

        //console.log(replyCode);

        return replyCode;
    }

    function getReply(code) {
        //console.log("incomingMessages");
        //console.log(incomingMessages);
        if (incomingMessages > 2) return;
        //incomingMessages++;
        var typeStartDelay = 1000 + (lastMessage.length * 40) + (Math.random() * 1000);
        setTimeout(friendIsTyping, typeStartDelay);

        var message = "";
        var responses = [];
        for (var i = 0; i < replies.length; i++) {
            //console.log("code ="+code);
            if (code == replies[i].id) {
                //console.log("i found the reply ="+replies[i].id)
                var arrayResponses = replies[i].text;
                //console.log("New responses:"+arrayResponses.length);
                for (var j = 0; j < arrayResponses.length; j++) {
                    incomingMessages++;
                    message += arrayResponses[j];
                    responses.push(arrayResponses[j]);
                    //console.log("MSG >> "+arrayResponses[j]);
                };
            };
        };

        var typeDelay = 300 + (message.length * 10);
        setTimeout(function() {
            for (var i = 0; i < responses.length; i++) {
                incomingMessages--;
                receiveMessage(responses[i]);
            };

            if (incomingMessages <= 0) {
                friendStoppedTyping();
            }
        }, typeDelay + typeStartDelay);

    }
    /*function getReply(){
    	if(incomingMessages>2) return;
    	incomingMessages++;
    	var typeStartDelay=1000+(lastMessage.length*40)+(Math.random()*1000);
    	setTimeout(friendIsTyping,typeStartDelay);

    	var source=lipsum.toLowerCase();
    	source=source.split(" ");
    	var start=Math.round(Math.random()*(source.length-1));
    	var length=Math.round(Math.random()*13)+1;
    	var end=start+length;
    	if(end>=source.length){
    		end=source.length-1;
    		length=end-start;
    	}
    	var message="";
    	for (var i = 0; i < length; i++) {
    		message+=source[start+i]+(i<length-1?" ":"");
    	};
    	message+=Math.random()<0.4?"?":"";
    	message+=Math.random()<0.2?" :)":(Math.random()<0.2?" :(":"");

    	var typeDelay=300+(message.length*50)+(Math.random()*1000);

    	setTimeout(function(){
    		receiveMessage(message);
    	},typeDelay+typeStartDelay);

    	setTimeout(function(){
    		incomingMessages--;
    		if(Math.random()<0.1){
    			getReply();
    		}
    		if(incomingMessages<=0){
    			friendStoppedTyping();
    		}
    	},typeDelay+typeStartDelay);
    } */


    function friendIsTyping() {
        //console.log("friendIsTyping!")
        if (isFriendTyping) return;

        isFriendTyping = true;

        var $dots = $("<div/>")
            .addClass('chat-effect-dots')
            .css({
                top: -30 + bleeding,
                left: 10
            })
            .appendTo($effectContainer);
        for (var i = 0; i < 3; i++) {
            var $dot = $("<div/>")
                .addClass("chat-effect-dot")
                .css({
                    left: i * 20
                })
                .appendTo($dots);
            TweenMax.to($dot, 0.3, {
                delay: -i * 0.1,
                y: 30,
                yoyo: true,
                repeat: -1,
                ease: Quad.easeInOut
            })
        };

        var $info = $("<div/>")
            .addClass("chat-info-typing")
            .text(typing)
            .css({
                transform: "translate3d(0,30px,0)"
            })
            .appendTo($infoContainer)

        TweenMax.to($info, 0.3, {
            y: 0,
            force3D: true
        });

        gooOn();
    }

    function friendStoppedTyping() {
        //console.log("friendStoppedTyping!")

        if (!isFriendTyping) return

        isFriendTyping = false;

        var $dots = $effectContainer.find(".chat-effect-dots");
        TweenMax.to($dots, 0.3, {
            y: 40,
            force3D: true,
            ease: Quad.easeIn,
        });

        var $info = $infoContainer.find(".chat-info-typing");
        TweenMax.to($info, 0.3, {
            y: 30,
            force3D: true,
            ease: Quad.easeIn,
            onComplete: function() {
                $dots.remove();
                $info.remove();

                gooOff();
            }
        });
    }

    function receiveMessage(message) {
        var messageElements = addMessage(message, false),
            $messageContainer = messageElements.$container,
            $messageBubble = messageElements.$bubble;

        //console.log("Acabo de enviar un mensaje al visitante:");
        //console.log(message);

        TweenMax.set($messageBubble, {
            transformOrigin: "60px 50%"
        })
        TweenMax.from($messageBubble, 0.4, {
            scale: 0,
            force3D: true,
            ease: Back.easeOut
        })
        TweenMax.from($messageBubble, 0.4, {
            x: -100,
            force3D: true,
            ease: Quint.easeOut
        })
    }

    function updateChatHeight() {
        $messagesContainer.css({
            height: 460 - $(".chat-input-bar").height()
        });
    }

    $input.keydown(function(event) {
        if (event.keyCode == KEY_ENTER) {
            event.preventDefault();
            sendMessage();
        }
    });
    $sendButton.click(function(event) {
        event.preventDefault();
        sendMessage();
        // $input.focus();
    });
    $sendButton.on("touchstart", function(event) {
        event.preventDefault();
        sendMessage();
        // $input.focus();
    });

    $input.on("input", function() {
        updateChatHeight();
    });

    gooOff();
    updateChatHeight();
})