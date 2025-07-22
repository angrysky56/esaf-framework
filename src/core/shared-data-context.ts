/**
 * Shared Data Context for ESAF Framework
 * @fileoverview Manages uploaded files and data accessible across all components and agents
 */

export interface DataItem {
  id: string;
  name: string;
  type: 'file' | 'text' | 'url' | 'json' | 'csv' | 'dataset';
  content: any;
  metadata: {
    size?: number;
    lastModified?: number;
    uploadedAt: number;
    mimeType?: string;
    parsed?: boolean;
    schema?: any;
  };
  parsedData?: {
    numerical?: number[];
    tabular?: Array<Record<string, any>>;
    text?: string;
    json?: any;
    structure?: string;
  };
}

export interface DataContextState {
  items: Map<string, DataItem>;
  recentAnalysis: Map<string, any>;
  sessionContext: {
    lastAnalysisType?: string;
    lastAgent?: string;
    activeDatasets: string[];
    analysisHistory: Array<{
      timestamp: number;
      agent: string;
      query: string;
      results: any;
    }>;
  };
}

/**
 * Shared data context that makes uploaded files and analysis results
 * available across all components (DataInputPanel, ChatInterface, Agents)
 */
export class SharedDataContext {
  private state: DataContextState;
  private listeners: Array<(state: DataContextState) => void> = [];

  constructor() {
    this.state = {
      items: new Map(),
      recentAnalysis: new Map(),
      sessionContext: {
        activeDatasets: [],
        analysisHistory: []
      }
    };
  }

  /**
   * Add a data item from file upload or other source
   */
  async addDataItem(dataItem: Partial<DataItem> & { name: string; content: any }): Promise<string> {
    const id = dataItem.id || this.generateId();

    const fullItem: DataItem = {
      id,
      name: dataItem.name,
      type: dataItem.type || this.inferType(dataItem.content),
      content: dataItem.content,
      metadata: {
        uploadedAt: Date.now(),
        size: this.calculateSize(dataItem.content),
        ...dataItem.metadata
      }
    };

    // Parse data if possible
    try {
      fullItem.parsedData = await this.parseDataContent(fullItem);
      fullItem.metadata.parsed = true;
    } catch (error) {
      console.warn(`Failed to parse data item ${id}:`, error);
      fullItem.metadata.parsed = false;
    }

    this.state.items.set(id, fullItem);

    // Add to active datasets if it's a dataset
    if (['csv', 'json', 'dataset'].includes(fullItem.type)) {
      this.state.sessionContext.activeDatasets.push(id);
    }

    this.notifyListeners();
    return id;
  }

  /**
   * Get all available data items
   */
  getDataItems(): DataItem[] {
    return Array.from(this.state.items.values());
  }

  /**
   * Get specific data item by ID
   */
  getDataItem(id: string): DataItem | undefined {
    return this.state.items.get(id);
  }

  /**
   * Get data items by type
   */
  getDataItemsByType(type: DataItem['type']): DataItem[] {
    return Array.from(this.state.items.values()).filter(item => item.type === type);
  }

  /**
   * Get all numerical data for analysis
   */
  getAllNumericalData(): { data: number[]; sources: string[] } {
    const allData: number[] = [];
    const sources: string[] = [];

    for (const item of this.state.items.values()) {
      if (item.parsedData?.numerical) {
        allData.push(...item.parsedData.numerical);
        sources.push(item.name);
      }
    }

    return { data: allData, sources };
  }

  /**
   * Get all tabular data for analysis
   */
  getAllTabularData(): { data: Array<Record<string, any>>; sources: string[] } {
    const allData: Array<Record<string, any>> = [];
    const sources: string[] = [];

    for (const item of this.state.items.values()) {
      if (item.parsedData?.tabular) {
        allData.push(...item.parsedData.tabular);
        sources.push(item.name);
      }
    }

    return { data: allData, sources };
  }

  /**
   * Check if any data is available for analysis
   */
  hasAnalyzableData(): boolean {
    return Array.from(this.state.items.values()).some(item =>
      item.parsedData?.numerical ||
      item.parsedData?.tabular ||
      item.type === 'csv' ||
      item.type === 'json'
    );
  }

  /**
   * Get data summary for agents
   */
  getDataSummary(): {
    totalItems: number;
    dataTypes: Record<string, number>;
    hasNumerical: boolean;
    hasTabular: boolean;
    recentItems: string[];
  } {
    const items = Array.from(this.state.items.values());
    const dataTypes: Record<string, number> = {};

    items.forEach(item => {
      dataTypes[item.type] = (dataTypes[item.type] || 0) + 1;
    });

    const recentItems = items
      .sort((a, b) => b.metadata.uploadedAt - a.metadata.uploadedAt)
      .slice(0, 3)
      .map(item => item.name);

    return {
      totalItems: items.length,
      dataTypes,
      hasNumerical: items.some(item => item.parsedData?.numerical),
      hasTabular: items.some(item => item.parsedData?.tabular),
      recentItems
    };
  }

  /**
   * Store analysis results for later reference
   */
  storeAnalysisResult(agent: string, query: string, results: any): void {
    const analysisId = this.generateId();

    this.state.recentAnalysis.set(analysisId, {
      agent,
      query,
      results,
      timestamp: Date.now()
    });

    this.state.sessionContext.analysisHistory.push({
      timestamp: Date.now(),
      agent,
      query,
      results
    });

    this.state.sessionContext.lastAgent = agent;
    this.notifyListeners();
  }

  /**
   * Get recent analysis results
   */
  getRecentAnalysis(limit: number = 5): any[] {
    return this.state.sessionContext.analysisHistory
      .slice(-limit)
      .reverse();
  }

  /**
   * Get context for agents (what data is available, recent analysis, etc.)
   */
  getAgentContext(): {
    availableData: DataItem[];
    numericalData: number[];
    tabularData: Array<Record<string, any>>;
    dataSummary: any;
    recentAnalysis: any[];
    sessionInfo: any;
  } {
    const { data: numericalData } = this.getAllNumericalData();
    const { data: tabularData } = this.getAllTabularData();

    return {
      availableData: this.getDataItems(),
      numericalData,
      tabularData,
      dataSummary: this.getDataSummary(),
      recentAnalysis: this.getRecentAnalysis(3),
      sessionInfo: this.state.sessionContext
    };
  }

  /**
   * Remove data item
   */
  removeDataItem(id: string): boolean {
    const removed = this.state.items.delete(id);

    // Remove from active datasets
    const activeIndex = this.state.sessionContext.activeDatasets.indexOf(id);
    if (activeIndex > -1) {
      this.state.sessionContext.activeDatasets.splice(activeIndex, 1);
    }

    if (removed) {
      this.notifyListeners();
    }

    return removed;
  }

  /**
   * Clear all data
   */
  clearAllData(): void {
    this.state.items.clear();
    this.state.recentAnalysis.clear();
    this.state.sessionContext.activeDatasets = [];
    this.notifyListeners();
  }

  /**
   * Subscribe to data context changes
   */
  subscribe(listener: (state: DataContextState) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Parse data content based on type
   */
  private async parseDataContent(item: DataItem): Promise<DataItem['parsedData']> {
    const parsed: DataItem['parsedData'] = {};

    if (item.type === 'csv' || (item.type === 'file' && typeof item.content === 'string' && item.content.includes(','))) {
      parsed.tabular = this.parseCSV(item.content);
      parsed.numerical = this.extractNumericalFromTabular(parsed.tabular);
      parsed.structure = 'tabular';
    }

    else if (item.type === 'json') {
      try {
        const jsonData = typeof item.content === 'string' ? JSON.parse(item.content) : item.content;
        parsed.json = jsonData;
        parsed.numerical = this.extractNumericalFromObject(jsonData);
        parsed.structure = Array.isArray(jsonData) ? 'array' : 'object';
      } catch (error) {
        console.warn('Failed to parse JSON:', error);
      }
    }

    else if (item.type === 'text') {
      parsed.text = typeof item.content === 'string' ? item.content : String(item.content);
      parsed.numerical = this.extractNumbersFromText(parsed.text);
      parsed.structure = 'text';
    }

    else if (Array.isArray(item.content)) {
      parsed.numerical = item.content.filter(x => typeof x === 'number');
      parsed.structure = 'array';
    }

    return parsed;
  }

  /**
   * Simple CSV parsing
   */
  private parseCSV(csvContent: string): Array<Record<string, any>> {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0] ? lines[0].split(',').map(h => h.trim().replace(/"/g, '')) : [];
    const rows: Array<Record<string, any>> = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (typeof line !== 'string') continue;
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: Record<string, any> = {};

      headers.forEach((header, index) => {
        const value = values[index] || '';
        // Try to parse as number
        const numValue = parseFloat(value);
        row[header] = !isNaN(numValue) ? numValue : value;
      });

      rows.push(row);
    }

    return rows;
  }

  /**
   * Extract numerical data from tabular data
   */
  private extractNumericalFromTabular(data: Array<Record<string, any>>): number[] {
    const numbers: number[] = [];

    data.forEach(row => {
      Object.values(row).forEach(value => {
        if (typeof value === 'number' && !isNaN(value)) {
          numbers.push(value);
        }
      });
    });

    return numbers;
  }

  /**
   * Extract numerical data from object/array
   */
  private extractNumericalFromObject(obj: any): number[] {
    const numbers: number[] = [];

    const extract = (item: any): void => {
      if (typeof item === 'number' && !isNaN(item)) {
        numbers.push(item);
      } else if (Array.isArray(item)) {
        item.forEach(extract);
      } else if (typeof item === 'object' && item !== null) {
        Object.values(item).forEach(extract);
      }
    };

    extract(obj);
    return numbers;
  }

  /**
   * Extract numbers from text content
   */
  private extractNumbersFromText(text: string): number[] {
    const numberRegex = /-?\d+\.?\d*/g;
    const matches = text.match(numberRegex);

    if (!matches) return [];

    return matches
      .map(match => parseFloat(match))
      .filter(num => !isNaN(num));
  }

  /**
   * Infer data type from content
   */
  private inferType(content: any): DataItem['type'] {
    if (content instanceof File) {
      if (content.type.includes('json')) return 'json';
      if (content.type.includes('csv') || content.name.endsWith('.csv')) return 'csv';
      return 'file';
    }

    if (typeof content === 'string') {
      if (content.includes(',') && content.includes('\n')) return 'csv';
      try {
        JSON.parse(content);
        return 'json';
      } catch {
        return 'text';
      }
    }

    if (Array.isArray(content) || typeof content === 'object') {
      return 'json';
    }

    return 'text';
  }

  /**
   * Calculate content size
   */
  private calculateSize(content: any): number {
    if (content instanceof File) return content.size;
    if (typeof content === 'string') return content.length;
    return JSON.stringify(content).length;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (error) {
        console.warn('Error in data context listener:', error);
      }
    });
  }
}

/**
 * Global shared data context instance
 */
export const sharedDataContext = new SharedDataContext();
