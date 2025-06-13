"use client";

import '../node_modules/primeflex/primeflex.css'

import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { InputText } from "primereact/inputtext";
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
        
import { Message } from 'primereact/message';       
import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { PrimeReactProvider } from 'primereact/api';
import 'primeicons/primeicons.css';
        

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
    
  const { user, signOut } = useAuthenticator();
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [newTodo, setNewTodo] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editTodo, setEditTodo] = useState<Schema["Todo"]["type"] | null>(null);
  const [editContent, setEditContent] = useState(""); // editable value for the input field
  const [showUpdateSuccess, setShowUpdateSuccess] = useState(false);
  const [showUpdateInfo, setShowUpdateInfo] = useState(false);

  function listTodos() {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => {
        const sorted = [...data.items].sort((a, b) => {
          const aTime = new Date(a.createdAt || "").getTime();
          const bTime = new Date(b.createdAt || "").getTime();
          return bTime - aTime; // descending order
        });
        setTodos(sorted);
      },
    });
  }

  useEffect(() => {
    listTodos();
  }, []);

  function createTodo() {
    if (!newTodo.trim()) {
      setShowInfo(true);
      setTimeout(() => setShowInfo(false), 4500);
      return;
    }

    client.models.Todo.create({
      content: newTodo.trim(),
    }).then(() => {
      setNewTodo("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000); // auto-hide after 3s
    });
  }

  async function handleUpdate() {
    if (!editTodo) return;

    const trimmed = editContent.trim();

    if (trimmed === "" || trimmed === editTodo.content?.trim()) {
      setShowUpdateInfo(true);
      setTimeout(() => setShowUpdateInfo(false), 5000);
      return;
    }

    await client.models.Todo.update({
      id: editTodo.id,
      content: trimmed,
    });

    setVisible(false);
    setEditTodo(null);
    setShowUpdateSuccess(true);
    setTimeout(() => setShowUpdateSuccess(false), 3000);
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }

  const start = (
    <img alt="logo" src="/TodoListLogo.png" height="55" className="mr-2"></img>
  );


  const end = (
    <div className="md:flex ml-auto">
      <Button
        label="Sign Out"
        icon="pi pi-sign-out"
        onClick={signOut}
        severity="secondary"
        style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
        rounded
      />
    </div>
  );

  return (
    <PrimeReactProvider>
      <Menubar
        start={start}
        end={end}
        style={{ border: 'none', borderRadius: '0', padding: '10px'}}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '3rem',
        }}
      >
        <div style={{ position: 'relative', height: '7rem', width: '100%' }}>
          {showInfo && (
            <div style={{ position: 'absolute', top: '-2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
              <Message
                style={{
                  border: 'solid #696cff',
                  borderWidth: '0 0 0 6px',
                  color: '#696cff'
                }}
                className="border-primary w-24rem justify-content-start"
                severity="info"
                text="Please Enter An Item to Add"
              />
            </div>
          )}

          {showSuccess && (
            <div style={{ position: 'absolute', top: '-2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
              <Message
                style={{
                  border: 'solid #1ea97c',
                  borderWidth: '0 0 0 6px',
                  color: '#1ea97c'
                }}
                className="border-success w-24rem justify-content-start"
                severity="success"
                text="Item Added Successfully"
              />
            </div>
          )}

          {showUpdateSuccess && (
            <div
              style={{
                position: 'absolute',
                top: '-2rem',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
              }}
            >
              <Message
                style={{
                  border: 'solid #1ea97c',
                  borderWidth: '0 0 0 6px',
                  color: '#1ea97c',
                }}
                className="border-success w-24rem justify-content-start"
                severity="success"
                text="Item Updated Successfully"
              />
            </div>
          )}

          <div className="flex justify-content-center align-items-center gap-2 mt-5">
            <InputText
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  createTodo();
                }
              }}
              className="w-20rem w-auto p-inputtext-lg"
              placeholder="Add An Item"
            />
            <Button
              icon="pi pi-plus"
              severity="success"
              aria-label="Add"
              size="large"
              onClick={createTodo}
            />
          </div>
        </div>


        <div className="flex flex-column align-items-center gap-3"
          style={{
            maxHeight: '70vh',       // Adjust as needed
            overflowY: 'auto',
            width: '100%',
            padding: '1rem 0',
          }}
        >
          {todos.map((todo) => (
            <div key={todo.id} className="flex align-items-center gap-2">
              <Card className="w-16rem p-0" style={{ height: '3.45rem', display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
                <p className="m-0 w-full text-center">{todo.content}</p>
              </Card>
              <Button
                icon="pi pi-pen-to-square"
                severity="warning"
                aria-label="Edit"
                size="large"
                onClick={() => {
                  setEditTodo(todo);
                  setEditContent(todo.content || "");
                  setVisible(true);
                }}
              />
              <Dialog
                header="Update Item"
                footer={
                  <Button
                    className="w-full"
                    label="Save"
                    severity="success"
                    onClick={handleUpdate}
                  />
                }
                visible={visible}
                onHide={() => {
                  setVisible(false);
                  setEditTodo(null);
                }}
                style={{ border: 'none', boxShadow: 'none' }}
                breakpoints={{ '960px': '75vw', '641px': '100vw' }}
                draggable={false}
              >
                {showUpdateInfo && (
                  <Message
                    style={{
                      border: 'solid #696cff',
                      borderWidth: '0 0 0 6px',
                      color: '#696cff',
                      marginBottom: '1rem'
                    }}
                    className="border-primary w-full justify-content-start"
                    severity="info"
                    text="Please Make Changes Before Attempting to Save"
                  />
                )}
                <InputText
                  style={{ width: '21.3rem' }}
                  type="text"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault(); // prevent default dialog close when pressing enter
                      handleUpdate(); // Runs full validation, including the info message
                    }
                  }}
                  className="p-inputtext-lg"
                />
              </Dialog>
              <Button icon="pi pi-times" severity="danger" aria-label="Delete" size="large" onClick={() => deleteTodo(todo.id)} />
            </div>
          ))}
        </div>

      </div>
    </PrimeReactProvider>
  );
}
