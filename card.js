// 8.定義五種狀態
const GAME_STATE = {
        FirstCardAwaits: "FirstCardAwaits",
        SecondCardAwaits: "SecondCardAwaits",
        CardsMatchFailed: "CardsMatchFailed",
        CardsMatched: "CardsMatched",
        GameFinished: "GameFinished",
    }
    // 定義四種撲克牌花色
const Symbols = [
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

const view = {
        // 2.產生數字和花色(6-1.取得牌背)
        getCardElement(index) {
            return `<div data-index="${index}" class="card back"></div>`
        },
        // 6-2.取得牌面
        getCardContent(index) {
            const number = this.transformNumber((index % 13) + 1) //產生撲克牌數字，呼叫特殊數字轉換函式
            const symbol = Symbols[Math.floor(index / 13)] // 產生撲克牌花色
            return `           
            <p>${number}</p>
            <img src="${symbol}" alt="">
            <p>${number}</p>
            `
        },
        // 3.特殊數字轉換
        transformNumber(number) {
            switch (number) {
                case 1:
                    return 'A'
                case 11:
                    return 'J'
                case 12:
                    return 'Q'
                case 13:
                    return 'K'
                default:
                    return number
            }
        },

        // 1.將卡片渲染至頁面
        displayCards(indexes) {
            const rootElement = document.querySelector('#cards')
                // 4.一次要產生 52 張卡片。5-1.呼叫洗牌演算法
            rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
        },

        // 7.翻牌函式(...會讓cards的形態變成陣列，就可以用map方法)
        flipCards(...cards) {
            cards.map(card => {
                if (card.classList.contains('back')) {
                    // 回傳正面
                    card.classList.remove('back')
                    card.innerHTML = this.getCardContent(Number(card.dataset.index))
                    return
                }
                // 回傳背面
                card.classList.add('back')
                card.innerHTML = null
            })
        },
        // 配對成功樣式
        pairCards(...cards) {
            cards.map(card => {
                card.classList.add('paired')
            })
        },
        renderScore(score) {
            document.querySelector('.score').textContent = `Score : ${score}`
        },
        renderTriedTimes(times) {
            document.querySelector('.tried').textContent = `You've tried : ${times} times`

        },

        appendWrongAnimation(...cards) {
            cards.map(card => {
                card.classList.add('wrong')
                card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
            })
        },

        showGameFinished() {
            const div = document.createElement('div')
            div.classList.add('completed')
            div.innerHTML = `
                <p>Complete!</p>
                <p>Score : ${model.score}</p>
                <p>You've tried: ${model.triedTimes} times</p>
            
            `
            const header = document.querySelector('#header')
            header.before(div)
        }
    }
    // 10.宣告model，由其管理資料
const model = {
    // 儲存被翻開的卡片
    revealedCards: [],
    isRevealedCardsMatched() {
        return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
    },
    score: 0,
    triedTimes: 0
}

// 9.宣告controller，由controller推進遊戲狀態
const controller = {
    // 等待翻開第一張卡片的狀態
    currentState: GAME_STATE.FirstCardAwaits,
    // 啟動初始遊戲
    generateCards() {
        view.displayCards(utility.getRandomNumberArray(52))
    },
    dispatchCardAction(card) {
        if (!card.classList.contains('back')) return
        switch (this.currentState) {
            case GAME_STATE.FirstCardAwaits:
                view.flipCards(card)
                model.revealedCards.push(card)
                this.currentState = GAME_STATE.SecondCardAwaits
                break
            case GAME_STATE.SecondCardAwaits:
                view.renderTriedTimes(++model.triedTimes)
                view.flipCards(card)
                model.revealedCards.push(card)
                    // 判斷是否配對成功
                if (model.isRevealedCardsMatched()) {
                    // 配對成功
                    view.renderScore(model.score += 10)
                    this.currentState = GAME_STATE.CardsMatched
                    view.pairCards(...model.revealedCards)
                    model.revealedCards = []
                    if (model.score === 260) {
                        console.log('showGameFinished')
                        this.currentState = GAME_STATE.GameFinished
                        view.showGameFinished()
                        return
                    }
                    this.currentState = GAME_STATE.FirstCardAwaits
                } else {
                    // 配對失敗
                    this.currentState = GAME_STATE.CardsMatchFailed
                    view.appendWrongAnimation(...model.revealedCards)
                    setTimeout(this.resetCards, 1000);
                }
                break
        }
        console.log('this.currentState', this.currentState)
        console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))

    },
    resetCards() {
        view.flipCards(...model.revealedCards)
        model.revealedCards = []
        controller.currentState = GAME_STATE.FirstCardAwaits
    }
}

// 5.洗牌演算法
const utility = {
    getRandomNumberArray(count) {
        const number = Array.from(Array(count).keys())
        for (let index = number.length - 1; index > 0; index--) {
            let randomIndex = Math.floor(Math.random() * (index + 1));
            [number[index], number[randomIndex]] = [number[randomIndex], number[index]]
        }
        return number
    }
}
controller.generateCards()
    // 6.事件監聽，為每一張卡片都綁上監聽器
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', event => {
        controller.dispatchCardAction(card)
    })
})