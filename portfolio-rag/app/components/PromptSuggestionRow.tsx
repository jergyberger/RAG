import PromptSuggestionButton from "./PromptSuggestionButton";

const PromptSuggestionsRow = ({onPromptClick}) => {
    const prompts = [
        "Who is Jørgen Maurstad Leiros?",
        "What projects has Jørgen worked on?",
        "What are Jørgen's key skills in data science and AI?",
        "What methodologies and tools does Jørgen use in data science?",
    ]
    return(
        <div className="prompt-suggestion-row">
            {prompts.map((prompt, index) => 
            <PromptSuggestionButton 
            key={`suggestion-${index}`} 
            text={prompt} 
            onClick={() => onPromptClick(prompt)}
            />)}
        </div>
    )
}

export default PromptSuggestionsRow;