import React from 'react'
import { Project } from '../types'
import { Draggable } from 'react-beautiful-dnd'

export default function Card({ project, index }: { project: Project; index: number }) {
  return (
    <Draggable draggableId={project.id} index={index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`border p-2 rounded bg-gray-50 ${snapshot.isDragging ? 'opacity-80' : 'opacity-100'}`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="font-medium">{project.title}</div>
              <div className="text-xs text-gray-600">{project.description}</div>
            </div>
            <div className="text-xs text-right">
              <div className="px-2 py-0.5 rounded text-white text-[10px]" style={{ backgroundColor: project.priority === 'High' ? '#dc2626' : project.priority === 'Medium' ? '#f59e0b' : '#10b981' }}>{project.priority}</div>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <div>{project.tags?.map((t) => <span key={t} className="mr-1">#{t}</span>)}</div>
            <div>{project.dueDate}</div>
          </div>
        </div>
      )}
    </Draggable>
  )
}
