package com.digitazon.TodoList.controllers;

import com.digitazon.TodoList.entities.Task;
import com.digitazon.TodoList.repositories.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tasks")
@CrossOrigin(origins = "*")
public class TaskController {
    @Autowired
    private TaskRepository taskRepository;

    @GetMapping("/")
    public Iterable<Task> home() {
        return taskRepository.findAll();
    }

    @GetMapping("/{id}")
    public Task read(@PathVariable int id) {
        return taskRepository.findById(id).orElseThrow();
    }

    @PostMapping("/add")
    public Task create(@RequestBody Task newTask) {
        return taskRepository.save(newTask);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable int id) {
        taskRepository.deleteById(id);
        return "ok";
    }

    @PutMapping("/{id}")
    public Task update(@PathVariable int id, @RequestBody Task updatedTask) throws Exception {
        Task task = taskRepository.findById(id).orElseThrow();
        if (task.isDone()) {
            throw new Exception("non puoi salvare un task già completato");
        }
        task.setName(updatedTask.getName());
        return taskRepository.save(task);
    }

    @PutMapping("/{id}/set-done")
    public Task setDone(@PathVariable int id, @RequestBody Task updatedTask) {
        Task task = taskRepository.findById(id).orElseThrow();
        task.setDone(updatedTask.isDone());
        return taskRepository.save(task);
    }



}
