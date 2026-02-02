import React from 'react'
import Column from './Column'
import { Project, Stage } from '../types'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'

const stages: Stage[] = ['Backlog', 'In Progress', 'Review', 'Done']

export default function Board({ projects, setProjects }: { projects: Project[]; setProjects: (p: Project[]) => void }) {
  function onDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result
    if (!destination) return
    const destStage = destination.droppableId as Stage
    setProjects((prev) => prev.map((p) => (p.id === draggableId ? { ...p, stage: destStage } : p)))
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col md:flex-row gap-4">
        {stages.map((s) => (
          <Column key={s} stage={s} projects={projects.filter((p) => p.stage === s)} />
        ))}
      </div>
    </DragDropContext>
  )
}
