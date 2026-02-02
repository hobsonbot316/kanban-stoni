import React from 'react'
import { Project, Stage } from '../types'
import Card from './Card'
import { Droppable } from 'react-beautiful-dnd'

export default function Column({ stage, projects }: { stage: Stage; projects: Project[] }) {
  return (
    <Droppable droppableId={stage}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps} className="bg-white rounded shadow p-3 flex-1 min-w-[220px]">
          <h2 className="font-semibold mb-2">{stage} <span className="text-sm text-gray-500">({projects.length})</span></h2>
          <div className="space-y-2 min-h-[40px]">
            {projects.map((p, index) => (
              <Card key={p.id} project={p} index={index} />
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  )
}
