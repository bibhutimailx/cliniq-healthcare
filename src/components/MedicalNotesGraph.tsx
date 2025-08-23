
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MedicalEntity {
  text: string;
  type: 'symptom' | 'condition' | 'medication' | 'date' | 'location' | 'modifier';
  confidence?: number;
}

interface MedicalNotesGraphProps {
  entities: MedicalEntity[];
  isProcessing: boolean;
}

const MedicalNotesGraph: React.FC<MedicalNotesGraphProps> = ({ entities, isProcessing }) => {
  const getEntityColor = (type: string) => {
    const colors = {
      symptom: 'bg-purple-100 text-purple-800 border-purple-300',
      condition: 'bg-green-100 text-green-800 border-green-300',
      medication: 'bg-blue-100 text-blue-800 border-blue-300',
      date: 'bg-gray-100 text-gray-800 border-gray-300',
      location: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      modifier: 'bg-pink-100 text-pink-800 border-pink-300'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const groupedEntities = entities.reduce((acc, entity) => {
    if (!acc[entity.type]) acc[entity.type] = [];
    acc[entity.type].push(entity);
    return acc;
  }, {} as Record<string, MedicalEntity[]>);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>AI Medical Entity Extraction</span>
          {isProcessing && (
            <div className="animate-pulse text-blue-600 text-sm">Processing...</div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.keys(groupedEntities).length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Start conversation to see extracted medical entities
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEntities).map(([type, entityList]) => (
              <div key={type} className="space-y-2">
                <h4 className="font-semibold capitalize text-gray-700">{type}s</h4>
                <div className="flex flex-wrap gap-2">
                  {entityList.map((entity, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className={`${getEntityColor(entity.type)} px-3 py-1 text-sm font-medium border-2`}
                    >
                      {entity.text}
                      {entity.confidence && (
                        <span className="ml-1 text-xs opacity-70">
                          ({Math.round(entity.confidence * 100)}%)
                        </span>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MedicalNotesGraph;
