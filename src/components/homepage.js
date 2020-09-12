import React, { Component } from 'react';
import api from '../utils/api'
import './homepage.css'

export class HomePage extends Component {
    constructor (props) {
        super(props);

        const savedUser = localStorage.getItem('samajhUser');

        if (savedUser) {
            console.log('Found saved user', savedUser);

            const { _id } = JSON.parse(savedUser);

            this.state = {
                fetchOldEntriesRequest: true,
                fetchOldEntriesSucess: false,
                fetchOldEntriesFailure: false,
                submitNewEntryRequest: false,
                submitNewEntrySuccess: false,
                submitNewEntryFailure: false,
                submittedImages: [],
                totalImages: [],
                isOldUser: true,
                userId: _id,
                oldEntries: [],
                folderPicked: false
    
            }


        } else {
            console.log('No saved user found', savedUser);


            this.state = {
            createNewUserRequest: false,
            createNewUserSucess: false,
            createNewUserFailure: false,
            submitNewEntryRequest: false,
            submitNewEntrySuccess: false,
            submitNewEntryFailure: false,
            submittedImages: [],
            totalImages: [],
            isOldUser: false,
            userId: `${+ new Date()}`,
            oldEntries: [],
            folderPicked: false

        }


        }

        
        this.directoryRef = React.createRef();

        this.getEntriesByUser = this.getEntriesByUser.bind(this);
        this.createNewEntry = this.createNewEntry.bind(this);
        this.handleSubmitButton = this.handleSubmitButton.bind(this);
        this.handleSkipButton = this.handleSkipButton.bind(this);
        this.handleDirectoryChange =  this.handleDirectoryChange.bind(this);
    }

    getEntriesByUser(userId) {

        this.setState({fetchOldEntriesRequest: true});

        api.getOldEntriesByUser(userId).then(
            (response) => {
                if (response.ok) {
                    this.setState({
                        fetchOldEntriesRequest:false,
                        fetchOldEntriesSucess: true,
                        fetchOldEntriesFailure: false,
                        oldEntries: response.data,
                    })
//                    this.generateNewPrompt();
                } else {
                    this.setState({
                        fetchOldEntriesRequest: false,
                        fetchOldEntriesFailure: true,
                        fetchOldEntriesSucess: false,
                        oldEntries: []
                    })
                }
            },
            (err) => {
                console.log('Error while fetching old entries' ,err);
                this.setState({
                    fetchOldEntriesRequest: false,
                    fetchOldEntriesFailure: true,
                })
            }
        )
    }

    createNewUser(userId) {
        this.setState({ createNewUserRequest: true });
        api.createUser({
            _id: userId,
            createdOn: new Date()
        }).then((response) => {
            if (response.ok) {
                this.setState({
                    createNewUserRequest: false,
                    createNewEntrySuccess: true,
                    createNewUserFailure: false,
                    userId: response.data._id
                })
                this.generateNewPrompt();
                localStorage.setItem('samajhUser', JSON.stringify(response.data))
            } else {
                this.setState({
                    createNewUserRequest: false,
                    createNewEntrySuccess: false,
                    createNewUserFailure: true,
                })
            }
        }, (error) => {
            console.log('Error occurred while creating user', error)
            this.setState({
                createNewUserFailure: true,
                createNewEntrySuccess: false,
            })

        })
    }

    generateNewPrompt() {
        const {imageIndex, totalImages} = this.state;
        if (imageIndex >= totalImages.length - 1) {
            alert('all the images were already processed')
            return
        }  
        this.setState({
            currentImage: `something_${+ new Date()}`,
            value: '',
            imageIndex: imageIndex + 1,
        })
    }


    
    createNewEntry(entry) {

        this.setState({createNewEntryRequest: true})

        api.createNewEntry(entry).then(
            (response) => {
                if (response.ok) {
                    this.setState({
                        createNewEntryRequest: false,
                        createNewEntrySuccess: true,
                        createNewEntryFailure: false,
                    })
                    this.generateNewPrompt();
                } else {
                    this.setState({
                        createNewEntryRequest: false,
                       createNewEntryFailure: true,
                       createNewEntrySuccess: false,
                    })
                }
            },
            (err) => {
                console.log('Error in creating new entry', err)
                this.setState({
                    createNewEntryRequest: false,
                    createNewEntryFailure: true
                })
            }
            );
    }


    handleSubmitButton() {
        const {userId, value, imageIndex, totalImages} = this.state;

        if (!value) { alert('Please provide a valid value'); return}

        console.log('here from handle submit ', totalImages[imageIndex])
        this.createNewEntry({ userId, path: totalImages[imageIndex].webkitRelativePath, value, timestamp: new Date()})
    }

    handleSkipButton() {
        this.generateNewPrompt();
    }

    handleDirectoryChange() { 

        console.log('From handle directory change', this.directoryRef.current.files[4]);
        console.log('Here is one of the file url', URL.createObjectURL(this.directoryRef.current.files[4]) )

        const { isOldUser, oldEntries } = this.state;

        function comparer(otherArray){
            return function(current){
              return otherArray.filter(function(other){
                return other.path == current.webkitRelativePath
              }).length == 0;
            }
          }
          

        if(isOldUser) {
            this.setState({folderPicked: true, imageIndex : 0, totalImages: Array.from(this.directoryRef.current.files).filter(comparer(oldEntries)) })
        } else {
            this.setState({folderPicked: true, imageIndex : 0, totalImages: this.directoryRef.current.files })
        }

        
    }






    componentDidMount() {

        const { isOldUser, userId } = this.state;
       
        if (isOldUser) {
            this.getEntriesByUser(userId)
        } else {
            this.createNewUser(userId)
        }


    }




    render () {

        const {   fetchOldEntriesRequest,
            fetchOldEntriesSucess,
            fetchOldEntriesFailure,
            createNewEntryRequest,
            submitNewEntrySuccess,
            submitNewEntryFailure,
            submittedImages,
            isOldUser,
            oldEntries,
            currentImage,
            folderPicked,
            imageIndex,
            totalImages,
            userId,
            value } = this.state;


       

            if (fetchOldEntriesRequest) {
                return (
                    <div>
                        Please wait while we analyze your previous submittions
                    </div>
                )
            }

            if (createNewEntryRequest) {
                return (
                    <div>
                        Please wait while we submit your current entry
                    </div>
                )
            }

            if (userId )
            return ( <div>
                    Welcome userID {userId}, Please select a local folder with images then provide the values or skip the image.

                    <p>
                    <input ref={this.directoryRef} onChange={this.handleDirectoryChange}  directory="" webkitdirectory="" type="file" />
                    </p>

                    
                        {folderPicked? <div> <img className='image-box' src={URL.createObjectURL(totalImages[imageIndex])}></img> 
                    


                    <div className="TxtInputFrame">
                    Image Details
                    </div>
                    <input
                        type="text"
                        className="InputFrame"
                        placeholder="Image Data"
                        value={this.state.value}
                        required
                    onChange={(e) => { this.setState({ value: e.target.value.trim() }) }} />

                    
<button type="button" onClick={ this.handleSubmitButton}>Submit Button</button>
                   
                    <p>
                    <button onClick={this.handleSkipButton}>Skip</button>
                    </p>
            </div> : <div>Thanks</div>} </div>
            )

            return (
                <div>
                    Failed to handle the cases
                </div>
            )




    }
}

export default HomePage;
