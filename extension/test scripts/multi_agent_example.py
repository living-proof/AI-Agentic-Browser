#AIzaSyClGEFGSg-HE0hI1ANbdR8aAUD27cevhlY
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.schema import SystemMessage
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.memory import ConversationBufferMemory

os.environ["GOOGLE_API_KEY"] = "AIzaSyClGEFGSg-HE0hI1ANbdR8aAUD27cevhlY"

# Shared Gemini LLM config
def make_llm():
    return ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.7)

# Create agent executor helper
def create_agent(name, system_prompt):
    prompt = ChatPromptTemplate.from_messages([
        SystemMessage(content=system_prompt),
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", "{input}"),  # This tells the prompt where user input goes
        MessagesPlaceholder(variable_name="agent_scratchpad")  # REQUIRED for LangChain agent
    ])
    
    memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
    llm = make_llm()
    
    agent = create_openai_functions_agent(llm, tools=[], prompt=prompt)
    return AgentExecutor(agent=agent, tools=[], memory=memory, verbose=True)


# === Define Agents ===
planner_agent = create_agent("PlannerAgent", "You are a planner. Break high-level research tasks into clear subtasks.")
researcher_agent = create_agent("ResearcherAgent", "You are a researcher. Respond to each subtask with Gemini-level insight.")
summarizer_agent = create_agent("SummarizerAgent", "You are a summarizer. Combine multiple research responses into a 100-word summary.")

# === Orchestrator ===
def run_multi_agent_system(task: str):
    print("\n📌 Starting PlannerAgent")
    plan = planner_agent.invoke({"input": task})
    
    subtasks = [line for line in plan['output'].split('\n') if line.strip()]
    
    print("\n📌 Subtasks Generated:\n", subtasks)

    all_results = []
    for subtask in subtasks:
        print(f"\n🔍 ResearcherAgent working on: {subtask}")
        result = researcher_agent.invoke({"input": subtask})
        all_results.append(result["output"])

    combined = "\n".join(all_results)
    print("\n📝 SummarizerAgent combining everything...")
    summary = summarizer_agent.invoke({"input": combined})

    return summary["output"]

# === Run the System ===
task = "Explain the impact of AI on education."
final_output = run_multi_agent_system(task)

print("\n✅ Final Summary:\n", final_output)
