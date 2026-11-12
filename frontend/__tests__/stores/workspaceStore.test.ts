import { useWorkspaceStore } from '@/store/workspaceStore';
import { Workspace } from '@/types';

describe('Workspace Store', () => {
  beforeEach(() => {
    localStorage.clear();
    useWorkspaceStore.setState({ currentWorkspace: null, workspaces: [] });
  });

  it('has initial state with empty workspaces and null currentWorkspace', () => {
    const state = useWorkspaceStore.getState();
    expect(state.currentWorkspace).toBeNull();
    expect(state.workspaces).toEqual([]);
  });

  it('sets currentWorkspace correctly', () => {
    const mockWorkspace: Workspace = {
      id: 'ws-101',
      name: 'Alpha Workspace',
      owner_id: 'user-123',
      invite_code: 'code-123',
      created_at: new Date().toISOString(),
      members: [],
    };

    useWorkspaceStore.getState().setCurrentWorkspace(mockWorkspace);
    expect(useWorkspaceStore.getState().currentWorkspace).toEqual(mockWorkspace);
  });

  it('sets multiple workspaces array', () => {
    const mockWorkspaces: Workspace[] = [
      {
        id: 'ws-1',
        name: 'Workspace One',
        owner_id: 'user-1',
        invite_code: 'code-1',
        created_at: new Date().toISOString(),
        members: [],
      },
      {
        id: 'ws-2',
        name: 'Workspace Two',
        owner_id: 'user-1',
        invite_code: 'code-2',
        created_at: new Date().toISOString(),
        members: [],
      },
    ];

    useWorkspaceStore.getState().setWorkspaces(mockWorkspaces);
    expect(useWorkspaceStore.getState().workspaces).toHaveLength(2);
    expect(useWorkspaceStore.getState().workspaces[0].name).toBe('Workspace One');
  });

  it('clears all workspaces and currentWorkspace on clearWorkspace', () => {
    const mockWorkspace: Workspace = {
      id: 'ws-101',
      name: 'Alpha Workspace',
      owner_id: 'user-123',
      invite_code: 'code-123',
      created_at: new Date().toISOString(),
      members: [],
    };

    useWorkspaceStore.setState({
      currentWorkspace: mockWorkspace,
      workspaces: [mockWorkspace],
    });

    useWorkspaceStore.getState().clearWorkspace();
    const state = useWorkspaceStore.getState();
    expect(state.currentWorkspace).toBeNull();
    expect(state.workspaces).toEqual([]);
  });
});

