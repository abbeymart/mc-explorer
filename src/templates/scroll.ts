export function scrollData() {
    const cardContainer = document.getElementById("card-container");
    const cardCountElem = document.getElementById("card-count");
    const cardTotalElem = document.getElementById("card-total");
    const loader = document.getElementById("loader");

    const cardLimit = 99;
    const cardIncrease = 9;
    const pageCount = Math.ceil(cardLimit / cardIncrease);
    let currentPage = 1;

    if (cardTotalElem) {
        cardTotalElem.innerHTML = cardLimit.toString();
    }
    let throttleTimer = false;
    const throttle = (callback: Function, time: number) => {
        if (throttleTimer) return;
        throttleTimer = true;
        setTimeout(() => {
            callback();
            throttleTimer = false;
        }, time);
    };

    const getRandomColor = () => {
        const h = Math.floor(Math.random() * 360);
        return `hsl(${h}deg, 90%, 85%)`;
    };

    const createCard = (index: number) => {
        const card = document.createElement("div");
        if (card) {
            card.className = "card";
            card.innerHTML = index.toString();
            card.style.backgroundColor = getRandomColor();
            if (cardContainer) {
                cardContainer.appendChild(card);
            }
        }
    };

    const addCards = (pageIndex: number) => {
        currentPage = pageIndex;
        const startRange = (pageIndex - 1) * cardIncrease;
        const endRange =
            currentPage == pageCount ? cardLimit : pageIndex * cardIncrease;
        if(cardCountElem) {
            cardCountElem.innerHTML = endRange.toString();
        }
        for (let i = startRange + 1; i <= endRange; i++) {
            createCard(i);
        }
    };

    const handleInfiniteScroll = () => {
        throttle(() => {
            const endOfPage =
                window.innerHeight + window.scrollY >= document.body.offsetHeight;

            if (endOfPage) {
                addCards(currentPage + 1);
            }

            if (currentPage === pageCount) {
                removeInfiniteScroll();
            }
        }, 1000);
    };

    const removeInfiniteScroll = () => {
        loader?.remove();
        window.removeEventListener("scroll", handleInfiniteScroll);
    };

    window.onload = function () {
        addCards(currentPage);
    };

    window.addEventListener("scroll", handleInfiniteScroll);
}