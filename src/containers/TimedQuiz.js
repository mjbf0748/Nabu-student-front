import React, { Component } from 'react';
import { withRouter, Prompt } from 'react-router-dom';
import { invokeApig } from '../libs/awsLib';
import {Button, ButtonToolbar, ToggleButton, ToggleButtonGroup} from 'react-bootstrap'
// './TimedQuiz.css'

class TimedQuiz extends Component {
    constructor(props) {
        super(props);

        this.state = {
            quiz: {},
            questions:[],
            user_answers: [],
            answer:[],
            correctAnswers: [],
            step: 0
        };
        this.selectAnswer = this.selectAnswer.bind(this);
        this.nextStep = this.nextStep.bind(this);
        this.backStep = this.backStep.bind(this);
        this.newQuestion = this.newQuestion.bind(this);


    }

    getQuiz() {
        return invokeApig({ path: `/quizzes1/${this.props.match.params.id}` }, 
        this.props.userToken);
   }


    async componentDidMount() {
        try {
            const result = await this.getQuiz();
            this.setState({
                quiz: result,
                questions: result.questions.Questions[this.state.step],
                answer: result.questions.Questions[this.state.step].Answers,
                quizLength: result.questions.Questions.length
            });
            for (var i = 0; i < result.questions.Questions.length; i++) {
                for (var j = 0; j < result.questions.Questions[i].Answers.length; j++) {
                    if (result.questions.Questions[i].Answers[j].correct) {
                        this.state.correctAnswers[i] = result.questions.Questions[i].Answers[j].answer;
                    }
                }
            }          
        } catch(e) {
            console.log(e);
            alert(e);
        }
    }

    nextStep() {
        this.setState({
                step: this.state.step + 1
            });
        var steps = this.state.step + 1;
        if (steps < this.state.quizLength) {
            this.newQuestion(steps);
    }        
}

    backStep() {
        this.setState({
                step: this.state.step - 1
            });
        var steps = this.state.step - 1;
        if (steps > -1) {
            this.newQuestion(steps);
    }        
}
    
    newQuestion(stepper) {
        this.setState({
                questions: this.state.quiz.questions.Questions[stepper],
                answer: this.state.quiz.questions.Questions[stepper].Answers,
            });
    }

    selectAnswer(event) {
        var user = this.state.user_answers;
        user[this.state.step] = event.target.value;
        this.setState({user_answers: user});  
    }

    computeScore() {
        var score = 0;
        for (var i = 0; i < this.state.user_answers.length; i++) {
            if (this.state.user_answers[i] === this.state.correctAnswers[i]) {
            score++;
        }
    }
        return (score/this.state.correctAnswers.length) * 100; 
    }

    renderResult(){
        return (<div>{this.computeScore()}</div>)
    }

    render() {
       
        const choice = ['A', 'B', 'C', 'D']
        let answerNodes = this.state.answer.map((value,index) => 
 //for (i=0; i<this.state.an)

         <div id="me">
             
             
             <ToggleButton vertical block className="me"
             type="radio" 
             value={this.state.answer[index].answer} 
             checked={this.state.user_answers[this.state.step] === this.state.answer[index].answer}
             onChange={this.selectAnswer}
             
>
                 {" " + choice[index] + ". " + this.state.answer[index].answer}
             </ToggleButton>
            
        </div>
        
    );
 
        return (
             
            <div className = "App">
                <h1 id="QuizName">{this.state.quiz.quizName}</h1>
                    {(this.state.step < this.state.quizLength ?
                    <form>
                        <Prompt 
                        when={true}
                        message="Are you sure you want to Quit? All progress will be lost."/>

                        <h3 id="QuizTitle">{(parseInt(this.state.step) + 1) + ": " + this.state.questions.title}?</h3>
                        {answerNodes}
                        <br/>
                        <div>
                        

                        <span id="Prevbtn">    
                        {this.state.step >= 1 ? 
                        <Button bsSize="lg" bsStyle="warning" type="button" onClick={this.backStep}>
                            Previous
                        </Button>
                         : 
                        null}
                        </span>
                        <span id="Nextbtn">
                        <Button bsSize="lg" bsStyle="primary" type="button" onClick={this.nextStep}>
                            Next
                        </Button>
                        </span>
                        </div>

                        
                    </form> 
                    
                    : <div>You scored{(this.renderResult())}</div>
                    )}
                    <h4>{/*new Date().toLocaleTimeString()*/}</h4>
            </div>
        )
    }

}

export default withRouter(TimedQuiz);
